import { NextResponse } from "next/server";
import dbConnect from "../../../lib/Mongodb";
import { verifyTokenWithLogout } from "../../../utils/jwt";
import PharmacyInvoice from "../../../models/PharmacyInvoice";
import Medicine from "../../../models/Medicine";

export async function GET(req) {
  await dbConnect();
  let type = req.nextUrl.searchParams.get("type");

  if (!["min", "max"].includes(type)) {
    return NextResponse.json(
      { message: "Invalid type. Use 'min' or 'max'.", success: false },
      { status: 400 }
    );
  }

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

  const days = type === "min" ? 21 : 49;
  const fieldToUpdate = `${type}imumStockCount.godown`;
  const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    const soldMedicines = await PharmacyInvoice.aggregate([
      {
        $match: {
          paymentMode: { $ne: "Credit-Others" },
          createdAt: { $gte: fromDate },
        },
      },
      { $unwind: "$medicines" },
      { $unwind: "$medicines.allocatedStock" },
      {
        $group: {
          _id: "$medicines.medicineId",
          totalStrips: { $sum: "$medicines.allocatedStock.quantity.strips" },
          totalTablets: { $sum: "$medicines.allocatedStock.quantity.tablets" },
        },
      },
    ]);

    const updatedMedicineIds = [];

    for (const item of soldMedicines) {
      const medicine = await Medicine.findById(item._id);
      if (!medicine || !medicine.packetSize) continue;

      const stripsPerBox = medicine.packetSize.strips || 1;
      const tabletsPerStrip = medicine.packetSize.tabletsPerStrip || 1;

      const totalTablets =
        item.totalStrips * tabletsPerStrip + item.totalTablets;
      const totalBoxes = Math.round(
        totalTablets / (stripsPerBox * tabletsPerStrip)
      );

      await Medicine.findByIdAndUpdate(item._id, {
        $set: {
          [fieldToUpdate]: totalBoxes ?? 0,
        },
      });

      updatedMedicineIds.push(item._id.toString());
    }
    console.log("updatedMedicineIds: ", updatedMedicineIds)

    await Medicine.updateMany(
      { _id: { $nin: updatedMedicineIds } },
      { $set: { [fieldToUpdate]: 0 } }
    );

    return NextResponse.json(
      {
        message: `${type}imum stock count updated successfully`,
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
