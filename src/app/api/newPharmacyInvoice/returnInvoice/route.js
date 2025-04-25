import { NextResponse } from "next/server";
import dbConnect from "../../../lib/Mongodb";
import { verifyTokenWithLogout } from "../../../utils/jwt";
import { generateUID } from "../../../utils/counter";
import PharmacyInvoice from "../../../models/PharmacyInvoice";
import RetailStock from "../../../models/RetailStock";

export async function GET(req) {
  let id = req.nextUrl.searchParams.get("id");
  if (id) {
    return NextResponse.json(
      { message: "ID not found.", success: false },
      { status: 404 }
    );
  }

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
  if (!decoded || !userRole) {
    let res = NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
    res.cookies.delete("authToken");
    return res;
  }
  const invoice = await PharmacyInvoice.findById(id).populate(
    "medicines.medicineId returns.medicines.medicineId"
  );

  if (!invoice) return null;

  const medicinesWithReturnableStock = invoice.medicines.map((med) => {
    let totalPurchased = 0;
    let missingPacketSize = false;

    med.allocatedStock.forEach((batch) => {
      const tabletsPerStrip = batch.packetSize?.tabletsPerStrip; // Check if this field exists
      if (tabletsPerStrip) {
        totalPurchased +=
          batch.quantity.strips * tabletsPerStrip + batch.quantity.tablets;
      } else {
        missingPacketSize = true; // Mark this batch as missing packet size
      }
    });

    // Calculate total returned quantity
    const totalReturned = invoice.returns
      ? invoice.returns.reduce((returnAcc, ret) => {
          const returnedMed = ret.medicines.find(
            (rm) => rm.medicineId.toString() === med.medicineId.toString()
          );
          if (returnedMed) {
            returnAcc += returnedMed.returnStock.reduce((batchAcc, batch) => {
              const tabletsPerStrip = batch.packetSize?.tabletsPerStrip;
              return (
                batchAcc +
                (tabletsPerStrip
                  ? batch.quantity.strips * tabletsPerStrip +
                    batch.quantity.tablets
                  : 0)
              );
            }, 0);
          }
          return returnAcc;
        }, 0)
      : 0;

    return {
      medicineId: med.medicineId,
      name: med.medicineId.name,
      allocatedStock: med.allocatedStock,
      returnableQuantity: totalPurchased - totalReturned,
      missingPacketSize, // Indicate if packetSize is missing
    };
  });

  return NextResponse.json(
    {
      medicinesWithReturnableStock,
      success: true,
    },
    { status: 200 }
  );
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
  if (!decoded || !userRole) {
    let res = NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
    res.cookies.delete("authToken");
    return res;
  }

  try {
    const { invoiceId, returnMedicineDetails } = await req.json();

    if (!invoiceId || !returnMedicineDetails) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing invoiceId or returnMedicineDetails",
        },
        { status: 400 }
      );
    }

    // Fetch invoice
    let invoice = await PharmacyInvoice.findById(invoiceId);
    if (!invoice) {
      return NextResponse.json(
        { success: false, message: "Invoice not found" },
        { status: 404 }
      );
    }

    let invalidReturns = [];
    let uid = "RI" + generateUID();
    let newReturnEntry = {
      returnId: uid,
      medicines: [],
      createdAt: new Date(),
    };

    for (const [medicineId, batchData] of Object.entries(
      returnMedicineDetails
    )) {
      let medicine = invoice.medicines.find(
        (med) => med.medicineId.toString() === medicineId
      );

      if (!medicine) {
        console.log("medicine not found....");
        invalidReturns.push(medicineId);
        continue;
      }

      let returnMedicine = { medicineId, returnStock: [] };

      for (const [batchIndex, returnQty] of Object.entries(batchData)) {
        let batch = medicine.allocatedStock[batchIndex];

        if (!batch) {
          invalidReturns.push(`Batch ${batchIndex} for medicine ${medicineId}`);
          continue;
        }

        let tabletsPerStrip =
          batch.packetSize?.tabletsPerStrip || returnQty.tabletsPerStrip;
        if (!tabletsPerStrip) {
          return NextResponse.json(
            {
              success: false,
              message: `Missing tabletsPerStrip for ${medicineId} batch ${batchIndex}`,
            },
            { status: 400 }
          );
        }

        let allocatedStrips =
          batch.quantity.strips * tabletsPerStrip + batch.quantity.tablets;
        let returnQtyStrips = parseInt(returnQty.strips) || 0;
        let returnQtyTablets = parseInt(returnQty.tablets) || 0;

        let returnStrips = returnQtyStrips * tabletsPerStrip + returnQtyTablets;

        let previousReturns = invoice.returns.flatMap((ret) =>
          ret.medicines
            .filter((med) => med.medicineId.toString() === medicineId)
            .flatMap((med) =>
              med.returnStock
                .filter((stock) => stock.batchName === batch.batchName)
                .map(
                  (stock) =>
                    stock.quantity.strips * tabletsPerStrip +
                    stock.quantity.tablets
                )
            )
        );

        let totalPreviousReturns = previousReturns.reduce((a, b) => a + b, 0);
        let totalAllowedReturn = allocatedStrips - totalPreviousReturns;
        // console.log("totalPreviousReturns", totalPreviousReturns);
        // console.log("allocatedStrips", allocatedStrips);
        // console.log("totalAllowedReturn", totalAllowedReturn);
        // console.log("returnStrips", returnStrips);
        if (returnStrips > totalAllowedReturn) {
          return NextResponse.json(
            {
              success: false,
              message: `Return quantity exceeds allocated stock`,
              // message: `Return quantity exceeds allocated stock for ${medicineId} batch ${batchIndex}`,
            },
            { status: 400 }
          );
        }

        const retailStock = await RetailStock.findOne({ medicine: medicineId });

        const batchIndex1 = retailStock.stocks.findIndex(
          (b) =>
            b.batchName === batch.batchName &&
            new Date(b.expiryDate).toISOString() ===
              new Date(batch.expiryDate).toISOString() &&
            b.sellingPrice === batch.sellingPrice
        );

        if (batchIndex1 > -1) {
          // Update existing stock
          retailStock.stocks[batchIndex1].quantity.totalStrips +=
            returnQtyStrips;
          retailStock.stocks[batchIndex1].quantity.tablets += returnQtyTablets;
          retailStock.stocks[batchIndex1].quantity.boxes = Math.floor(
            retailStock.stocks[batchIndex1].quantity.totalStrips /
              retailStock.stocks[batchIndex1].packetSize.strips
          );
          retailStock.stocks[batchIndex1].quantity.extra =
            retailStock.stocks[batchIndex1].quantity.totalStrips %
            retailStock.stocks[batchIndex1].packetSize.strips;
        } else {
          // Push new batch
          retailStock.stocks.push({
            batchName: batch.batchName,
            expiryDate: batch.expiryDate,
            packetSize: {
              strips: batch.packetSize.strips,
              tabletsPerStrip,
            },
            quantity: {
              boxes: Math.floor(returnQtyStrips / batch.packetSize.strips) || 0,
              extra: returnQtyStrips % batch.packetSize.strips || 0,
              tablets: returnQtyTablets,
              totalStrips: returnQtyStrips,
            },
            purchasePrice: batch.purchasePrice,
            sellingPrice: batch.sellingPrice,
          });
        }

        await retailStock.save();

        returnMedicine.returnStock.push({
          batchName: batch.batchName,
          expiryDate: batch.expiryDate,
          sellingPrice: batch.sellingPrice,
          // quantity: returnQty.strips * tabletsPerStrip + returnQty.tablets,
          quantity: { strips: returnQtyStrips, tablets: returnQtyTablets },
          price: (
            returnQtyStrips * batch.sellingPrice +
            (returnQtyTablets / tabletsPerStrip) * batch.sellingPrice
          ).toFixed(2),
        });
      }

      newReturnEntry.medicines.push(returnMedicine);
    }

    console.log(invalidReturns);
    if (invalidReturns.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid return details for: ${invalidReturns.join(", ")}`,
          invalidReturns,
        },
        { status: 400 }
      );
    }

    // Add new return entry
    invoice.returns.push(newReturnEntry);

    // Save updated invoice
    await invoice.save();

    let updatedInvoice = await PharmacyInvoice.findById(invoice._id)
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

    return NextResponse.json(
      {
        success: true,
        message: "Return processed successfully",
        invoice: updatedInvoice,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
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
  if (!decoded || !userRole) {
    let res = NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
    res.cookies.delete("authToken");
    return res;
  }

  try {
    const { invoiceId, returnId } = await req.json();

    const newDate = new Date();

    if (!invoiceId || !returnId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing invoiceId or returnId",
        },
        { status: 400 }
      );
    }
    const updatedInvoice = await PharmacyInvoice.findOneAndUpdate(
      { _id: invoiceId, "returns.returnId": returnId },
      { $set: { "returns.$.isReturnAmtPaid": newDate } },
      { new: true }
    );
    if (!updatedInvoice) {
      return NextResponse.json(
        {
          success: false,
          message: "Invoice or Return not found!",
        },
        { status: 404 }
      );
    }

    let updatedNewInvoice = await PharmacyInvoice.findById(updatedInvoice._id)
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
    return NextResponse.json(
      {
        success: true,
        message: "Return processed successfully",
        invoice: updatedNewInvoice,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
