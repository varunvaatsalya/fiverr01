import { NextResponse } from "next/server";
import dbConnect from "../../../lib/Mongodb";
import { verifyToken } from "../../../utils/jwt";
import Patient from "../../../models/Patients";
import Medicine from "../../../models/Medicine";
import RetailStock from "../../../models/RetailStock";
import PharmacyInvoice from "../../../models/PharmacyInvoice";

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
  const decoded = await verifyToken(token.value);
  const userRole = decoded.role;
  if (!decoded || !userRole) {
    return NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
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
