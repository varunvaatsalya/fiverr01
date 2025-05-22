import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyTokenWithLogout } from "../../utils/jwt";
import Patient from "../../models/Patients";
import Medicine from "../../models/Medicine";
import RetailStock from "../../models/RetailStock";
import PharmacyInvoice from "../../models/PharmacyInvoice";
import Admission from "../../models/Admissions";
import { generateUniqueId } from "../../utils/counter";

function getGrandTotal(medicineDetails) {
  const grandTotal = medicineDetails.reduce((grandTotal, medicine) => {
    if (
      medicine.allocatedQuantities &&
      medicine.allocatedQuantities.length > 0
    ) {
      const totalPrice = medicine.allocatedQuantities.reduce(
        (total, batch) => total + batch.price,
        0
      );
      return grandTotal + totalPrice;
    }
    return grandTotal;
  }, 0);
  return grandTotal;
}

function getDiscountedTotal(medicineDetails, discount) {
  if (!discount) return getGrandTotal(medicineDetails);
  if (discount < 0 || discount > 5) return getGrandTotal(medicineDetails);

  const grandTotal = medicineDetails.reduce((grandTotal, medicine) => {
    if (
      medicine.allocatedQuantities &&
      medicine.allocatedQuantities.length > 0
    ) {
      let totalPrice = medicine.allocatedQuantities.reduce(
        (total, batch) => total + batch.price,
        0
      );
      if (medicine.isDiscountApplicable !== false) {
        totalPrice = (totalPrice * (100 - discount)) / 100;
      }
      return grandTotal + totalPrice;
    }
    return grandTotal;
  }, 0);
  return grandTotal;
}

async function generateUID() {
  const prefix = "IN";
  // const timestamp = Math.floor(Date.now() / 1000).toString(); // Current timestamp in seconds
  const uniqueDigit = await generateUniqueId("pharmacyInvoice");
  const uniqueID = `${prefix}${uniqueDigit}`;
  return uniqueID;
}

export async function GET(req) {
  await dbConnect();

  let info = req.nextUrl.searchParams.get("info");
  let page = req.nextUrl.searchParams.get("page");
  let isReturn = req.nextUrl.searchParams.get("isReturn");
  let pending = req.nextUrl.searchParams.get("pending");

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
  const userEditPermission = decoded?.editPermission;
  if (!decoded || !userRole) {
    let res = NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
    res.cookies.delete("authToken");
    return res;
  }

  try {
    if (info === "1") {
      let patientsList = await Patient.find({}, "_id name uhid")
        .sort({ _id: -1 })
        .limit(200)
        .exec();

      const medicinesList = await Medicine.find()
        .select("name _id packetSize isTablets")
        .populate({
          path: "salts",
          select: "name _id",
        })
        .sort({ name: 1 })
        .exec();
      return NextResponse.json(
        { patientsList, medicinesList, success: true },
        { status: 200 }
      );
    }
    page = parseInt(page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;
    let query = {};
    if (pending === "1") {
      query = { isDelivered: { $exists: false } };
    }
    let userOrderQuery = pending === "1" ? {} : { _id: -1 };
    if (isReturn === "1") {
      query.returns = { $exists: true, $not: { $size: 0 } };
    }
    const allPharmacyInvoices = await PharmacyInvoice.find(query)
      .sort(userOrderQuery)
      .skip(skip)
      .limit(limit)
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
      .populate({
        path: "createdBy",
        select: "name email",
      });

    const totalPharmacyInvoices = await PharmacyInvoice.countDocuments();

    return NextResponse.json(
      {
        allPharmacyInvoices,
        totalPages: Math.ceil(totalPharmacyInvoices / limit),
        userRole,
        userEditPermission,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching details:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  let info = req.nextUrl.searchParams.get("info");

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
  // if (userRole !== "admin" && userRole !== "salesman") {
  //   return NextResponse.json(
  //     { message: "Access denied. admins only.", success: false },
  //     { status: 403 }
  //   );
  // }

  const {
    requestedMedicine,
    selectedPatient,
    selectedPaymentMode,
    discount,
    discountToAllMedicine,
  } = await req.json();

  if (!requestedMedicine || requestedMedicine.length === 0) {
    return NextResponse.json(
      { message: "No medicines requested", success: false },
      { status: 400 }
    );
  }
  try {
    const result = [];
    const requestedMedicineIds = requestedMedicine.map((med) => med.medicineId);
    const retailStock = await RetailStock.find({
      medicine: { $in: requestedMedicineIds },
    });

    for (const request of requestedMedicine) {
      const { medicineId, isTablets, quantity } = request;
      let isDiscountApplicable = true;
      const stock = retailStock.find((rs) => rs.medicine.equals(medicineId));

      if (!stock || !stock.stocks || stock.stocks.length === 0) {
        result.push({ medicineId, status: "Out of Stock" });
        continue;
      }

      let remainingQuantity = isTablets
        ? { strips: quantity.strips, tablets: quantity.tablets }
        : { strips: quantity.normalQuantity, tablets: 0 };

      let updatedStocks = [...stock.stocks].sort(
        (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)
      );

      const allocatedQuantities = [];

      for (const batch of updatedStocks) {
        const {
          packetSize,
          quantity: stockQuantity,
          sellingPrice,
          purchasePrice,
          expiryDate,
        } = batch;

        let stripsNeeded = remainingQuantity.strips;
        let tabletsNeeded = remainingQuantity.tablets;

        let stripsAllocated = 0;
        let tabletsAllocated = 0;

        if (stripsNeeded > 0) {
          if (stockQuantity.totalStrips >= stripsNeeded) {
            stripsAllocated = stripsNeeded;
            stockQuantity.totalStrips -= stripsNeeded;
            stripsNeeded = 0;
          } else {
            stripsAllocated = stockQuantity.totalStrips;
            stripsNeeded -= stockQuantity.totalStrips;
            stockQuantity.totalStrips = 0;
          }
        }

        if (isTablets && tabletsNeeded > 0) {
          const availableTablets =
            stockQuantity.totalStrips * packetSize.tabletsPerStrip +
            stockQuantity.tablets;

          if (availableTablets >= tabletsNeeded) {
            tabletsAllocated = tabletsNeeded;

            // Deduct tablets directly from stock
            if (stockQuantity.tablets >= tabletsNeeded) {
              stockQuantity.tablets -= tabletsNeeded;
            } else {
              // Calculate strips and remaining tablets needed
              const extraTabletsNeeded = tabletsNeeded - stockQuantity.tablets;
              stockQuantity.tablets = 0;

              const extraStripsNeeded = Math.ceil(
                extraTabletsNeeded / packetSize.tabletsPerStrip
              );

              stockQuantity.totalStrips -= extraStripsNeeded;
              stockQuantity.tablets =
                extraStripsNeeded * packetSize.tabletsPerStrip -
                extraTabletsNeeded;
            }
            tabletsNeeded = 0;
          } else {
            // Use all available tablets
            tabletsAllocated = availableTablets;
            tabletsNeeded -= availableTablets;
            stockQuantity.totalStrips = 0;
            stockQuantity.tablets = 0;
          }
        }

        remainingQuantity.strips = stripsNeeded;
        remainingQuantity.tablets = tabletsNeeded;

        // Update boxes and extras for this stock
        stockQuantity.boxes = Math.floor(
          stockQuantity.totalStrips / packetSize.strips
        );
        stockQuantity.extra = stockQuantity.totalStrips % packetSize.strips;

        let totalprice =
          (stripsAllocated + tabletsAllocated / packetSize.tabletsPerStrip) *
          sellingPrice;

        if (!discountToAllMedicine) {
          if (!sellingPrice || !purchasePrice || sellingPrice < purchasePrice)
            isDiscountApplicable = false;

          if (isDiscountApplicable) {
            isDiscountApplicable =
              ((sellingPrice - purchasePrice) / sellingPrice) * 100 > 10;
          }
        }

        allocatedQuantities.push({
          batchName: batch.batchName,
          expiryDate,
          stripsAllocated,
          tabletsAllocated,
          sellingPrice,
          purchasePrice,
          packetSize,
          price: parseFloat(totalprice.toFixed(2)),
        });

        if (remainingQuantity.strips <= 0 && remainingQuantity.tablets <= 0) {
          break;
        }
      }
      // updatedStocks = updatedStocks.filter(
      //   (batch) => batch.quantity.totalStrips > 0 || batch.quantity.tablets > 0
      // );

      if (remainingQuantity.strips > 0 || remainingQuantity.tablets > 0) {
        result.push({
          medicineId,
          isDiscountApplicable,
          status: "Insufficient Stock",
          remainingQuantity,
          allocatedQuantities,
        });
      } else {
        result.push({
          medicineId,
          isDiscountApplicable,
          status: "Fulfilled",
          allocatedQuantities,
        });
      }

      // console.log(`Medicine ID: ${medicineId}`);
      // console.log("Allocated Quantities:", allocatedQuantities);
    }

    // TODO: check this line
    retailStock.forEach((medicine) => {
      medicine.stocks = medicine.stocks.filter((batch) => {
        const { totalStrips, tablets } = batch.quantity;
        return totalStrips !== 0 || tablets !== 0;
      });
    });

    if (info === "1") {
      return NextResponse.json(
        {
          updatedRetailStock: retailStock,
          requestResults: result,
          success: true,
        },
        { status: 200 }
      );
    }
    
    if (!selectedPatient) {
      return NextResponse.json(
        { message: "Please select a patient", success: false },
        { status: 400 }
      );
    }
    if (!selectedPaymentMode) {
      return NextResponse.json(
        { message: "Please select a payment mode", success: false },
        { status: 400 }
      );
    }
    
    let inid = await generateUID();
    if (selectedPaymentMode === "Credit-Insurance") {
      const admission = await Admission.findOne({
        patientId: selectedPatient,
        isCompleted: false,
      });
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
      // items.forEach((item) => {
      admission.supplementaryService.push({
        name: `Medicine InId - ${inid}`,
        amount: getDiscountedTotal(result, discount),
        date: new Date(),
      });
      // });
      await admission.save();
    }

    // Otherwise, save changes to the database and create an invoice
    if (selectedPaymentMode !== "Credit-Others") {
      await Promise.all(
        retailStock.map((stock) =>
          RetailStock.findByIdAndUpdate(stock._id, { stocks: stock.stocks })
        )
      );
    }
    let subtotal = getGrandTotal(result);
    let total = getDiscountedTotal(result, discount);
    // console.log(JSON.stringify(result), 123456);

    const invoice = new PharmacyInvoice({
      patientId: selectedPatient,
      inid,
      medicines: result
        .map(
          ({
            medicineId,
            status,
            isDiscountApplicable,
            allocatedQuantities,
          }) => {
            if (!allocatedQuantities) {
              return null;
            }
            return {
              medicineId,
              status,
              isDiscountApplicable,
              allocatedStock: allocatedQuantities.map((item) => ({
                batchName: item.batchName,
                expiryDate: item.expiryDate,
                packetSize: item.packetSize,
                sellingPrice: item.sellingPrice,
                purchasePrice: item.purchasePrice,
                quantity: {
                  strips: item.stripsAllocated,
                  tablets: item.tabletsAllocated,
                },
              })),
            };
          }
        )
        .filter((medicine) => medicine !== null),
      paymentMode: selectedPaymentMode,
      price: {
        discount,
        subtotal,
        total,
      },
      createdBy: userRole === "admin" || !userId ? null : userId,
      createdByRole: userRole,
    });
    if (selectedPaymentMode === "Credit-Others") {
      invoice.isDelivered = new Date();
    }

    // console.log("Invoice:", JSON.stringify(invoice));
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

export async function PUT(req) {
  await dbConnect();
  let delivered = req.nextUrl.searchParams.get("delivered");

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
  if (!decoded || !userRole) {
    let res = NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
    res.cookies.delete("authToken");
    return res;
  }
  if (
    userRole !== "admin" &&
    userRole !== "salesman" &&
    userRole !== "dispenser"
  ) {
    return NextResponse.json(
      { message: "Access denied. Admins only.", success: false },
      { status: 403 }
    );
  }

  const { id, paymentMode } = await req.json();

  try {
    const invoice = await PharmacyInvoice.findById(id);
    if (!invoice) {
      return NextResponse.json(
        { success: false, message: "Invoice not found" },
        { status: 404 }
      );
    }
    if (delivered === "1") {
      if (invoice.isDelivered) {
        return NextResponse.json(
          { success: false, message: "Already delivered" },
          { status: 200 }
        );
      }
      invoice.isDelivered = new Date();
    }
    if (paymentMode) invoice.paymentMode = paymentMode;
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
        success: true,
        message: "Delivery status updated",
        invoice: populatedInvoice,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during update:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
