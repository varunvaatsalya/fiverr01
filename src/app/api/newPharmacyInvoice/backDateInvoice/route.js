import dbConnect from "@/app/lib/Mongodb";
import Admissions from "@/app/models/Admissions";
import PharmacyInvoice from "@/app/models/PharmacyInvoice";
import { generateUniqueId } from "@/app/utils/counter";
import { verifyTokenWithLogout } from "@/app/utils/jwt";
import { NextResponse } from "next/server";

function getGrandTotal(medicines) {
  const grandTotal = medicines.reduce((grandTotal, med) => {
    let total = 0;
    const mrp = med.mrp || 0;
    if (med.medicine?.isTablets) {
      const strips = med.quantity?.strips || 0;
      const tablets = med.quantity?.tablets || 0;
      const tabletsPerStrip = med.medicine?.packetSize?.tabletsPerStrip || 1;

      total = strips * mrp + (tablets * mrp) / tabletsPerStrip;
    } else {
      const qty = med.quantity?.normalQuantity || 0;
      total = qty * mrp;
    }
    return grandTotal + total;
  }, 0);
  return parseFloat(grandTotal.toFixed(2));
}

async function generateUID(createdAt) {
  const prefix = "IN";
  // const timestamp = Math.floor(Date.now() / 1000).toString(); // Current timestamp in seconds
  const uniqueDigit = await generateUniqueId("pharmacyInvoice", createdAt);
  const uniqueID = `${prefix}${uniqueDigit}`;
  return uniqueID;
}

function getDiscountedTotal(medicines, discount) {
  if (!medicines || medicines.length === 0) return 0;
  if (!discount || discount < 0 || discount > 5)
    return getGrandTotal(medicines);

  let grandTotal = getGrandTotal(medicines);
  grandTotal = (grandTotal * (100 - discount)) / 100;

  return parseFloat(grandTotal.toFixed(2));
}

export async function POST(req) {
  await dbConnect();
  const token = req.cookies.get("authToken");
  if (!token) {
    console.log("Token not found. Redirecting to login.");
    return NextResponse.json(
      { message: "Access denied. No token provided.", success: false },
      { status: 401 }
    );
  }
  const decoded = await verifyTokenWithLogout(token.value);
  const userRole = decoded?.role;
  const userId = decoded._id;
  if (!decoded || !userRole) {
    let res = NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
    res.cookies.delete("authToken");
    return res;
  }
  //   if (userRole !== "admin" && userRole !== "salesman") {
  //     return NextResponse.json(
  //       { message: "Access denied. admins only.", success: false },
  //       { status: 403 }
  //     );
  //   }

  const {
    medicines,
    selectedPatient,
    createdAt,
    discount,
    selectedPaymentMode,
  } = await req.json();

  if (
    !medicines ||
    medicines.length === 0 ||
    !createdAt ||
    !selectedPatient ||
    !selectedPaymentMode
  ) {
    return NextResponse.json(
      { message: "Invalid Request", success: false },
      { status: 400 }
    );
  }
  try {
    const inid = await generateUID(createdAt);
    let createdAtDate = new Date(createdAt);
    const randomMinutes = Math.floor(Math.random() * (30 - 5 + 1)) + 5;
    const isDelivered = new Date(
      createdAtDate.getTime() + randomMinutes * 60000
    );

    let total = getDiscountedTotal(medicines, discount || 0);

    if (selectedPaymentMode === "Credit-Insurance") {
      const query = {
        patientId: selectedPatient._id,
        isCompleted: false,
      };

      if (createdAt) {
        query.admissionDate = { $lte: new Date(createdAt) };
        query.$or = [
          { dischargeDate: { $gte: new Date(createdAt) } },
          { dischargeDate: null },
        ];
      }

      const admission = await Admissions.findOne(query);
      if (!admission) {
        return NextResponse.json(
          {
            success: false,
            message: "No active admission found for this patient.",
          },
          { status: 404 }
        );
      }
      if (!admission.insuranceInfo || !admission.insuranceInfo.providerName) {
        return NextResponse.json(
          {
            success: false,
            message: "This Patient is not registered for the Insurence",
          },
          { status: 400 }
        );
      }
      admission.supplementaryService.push({
        name: `Medicine InId - ${inid}`,
        amount: total,
        date: new Date(createdAt),
      });
      // });
      await admission.save();
    }

    const invoice = new PharmacyInvoice({
      patientId: selectedPatient._id,
      inid,
      medicines: medicines
        .map(({ medicine, quantity, batch, expiry, purchasePrice, mrp }) => {
          if (
            !medicine ||
            !quantity ||
            !batch ||
            !expiry ||
            !purchasePrice ||
            !mrp
          ) {
            return null;
          }
          let qty = medicine.isTablets
            ? { strips: quantity.strips, tablets: quantity.tablets }
            : { strips: quantity.normalQuantity, tablets: 0 };

          return {
            medicineId: medicine._id,
            status: "Fulfilled",
            isDiscountApplicable: true,
            allocatedStock: [
              {
                batchName: batch,
                expiryDate: expiry,
                packetSize: medicine.packetSize,
                sellingPrice: mrp,
                purchasePrice: purchasePrice,
                quantity: qty,
              },
            ],
          };
        })
        .filter((medicine) => medicine !== null),
      paymentMode: selectedPaymentMode,
      price: {
        discount: discount || 0,
        subtotal: getGrandTotal(medicines),
        total,
      },
      createdBy: userRole === "admin" || !userId ? null : userId,
      createdByRole: userRole,
      isDelivered,
      createdAt: createdAtDate,
    });

    await invoice.save();
    const populatedInvoice = await PharmacyInvoice.findById(invoice._id)
      .populate({
        path: "patientId",
        select: "name uhid address age gender mobileNumber",
      })
      .populate({
        path: "medicines.medicineId",
        select: "name salts isTablets medicineType packetSize rackPlace",
        populate: {
          path: "salts",
          select: "name",
        },
      })
      .exec();

    return NextResponse.json(
      {
        message: "Invoice created successfully",
        invoice: populatedInvoice,
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
