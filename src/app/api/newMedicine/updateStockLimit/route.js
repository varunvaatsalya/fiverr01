import { NextResponse } from "next/server";
import dbConnect from "../../../lib/Mongodb";
import { verifyTokenWithLogout } from "../../../utils/jwt";
import PharmacyInvoice from "../../../models/PharmacyInvoice";
import Medicine from "../../../models/Medicine";

let cache = {
  timestamp: 0,
};

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export async function GET(req) {
  await dbConnect();

  const sectionType = req.nextUrl.searchParams.get("sectionType");

  if (sectionType === "hospital") {
    return NextResponse.json(
      { message: "Invalid mode.", success: false },
      { status: 404 }
    );
  }

  const token = req.cookies.get("authToken");
  if (!token) {
    return NextResponse.json(
      { message: "Access denied. No token provided.", success: false },
      { status: 401 }
    );
  }

  const decoded = await verifyTokenWithLogout(token.value);
  const userRole = decoded?.role;
  if (!decoded || !userRole) {
    const res = NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
    res.cookies.delete("authToken");
    return res;
  }

  if (Date.now() - cache.timestamp < CACHE_DURATION) {
    return NextResponse.json(
      { message: "Try to update after 15 minutes...", success: false },
      { status: 400 }
    );
  }

  try {
    // 1. Get sales data of last 49 days (max of both windows)
    const fromDate = new Date(Date.now() - 49 * 24 * 60 * 60 * 1000);

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
          entries: {
            $push: {
              createdAt: "$createdAt",
              strips: "$medicines.allocatedStock.quantity.strips",
              tablets: "$medicines.allocatedStock.quantity.tablets",
            },
          },
        },
      },
    ]);

    const updatedMedicineIds = [];

    for (const item of soldMedicines) {
      const medicine = await Medicine.findById(item._id);
      if (!medicine || !medicine.packetSize) continue;

      const tabletsPerStrip = medicine.packetSize.tabletsPerStrip || 1;

      let minGodownTotalTablets = 0;
      let maxGodownTotalTablets = 0;
      let minRetailTotalTablets = 0;
      let maxRetailTotalTablets = 0;

      const now = Date.now();
      const minGodownCutoff = now - 21 * 24 * 60 * 60 * 1000;
      const maxGodownCutoff = now - 49 * 24 * 60 * 60 * 1000;
      const minRetailCutoff = now - 7 * 24 * 60 * 60 * 1000;
      const maxRetailCutoff = now - 10 * 24 * 60 * 60 * 1000;

      for (const entry of item.entries) {
        const time = new Date(entry.createdAt).getTime();
        const total = (entry.strips ?? 0) * tabletsPerStrip + (entry.tablets ?? 0);

        if (time >= minGodownCutoff) minGodownTotalTablets += total;
        if (time >= maxGodownCutoff) maxGodownTotalTablets += total;
        if (time >= minRetailCutoff) minRetailTotalTablets += total;
        if (time >= maxRetailCutoff) maxRetailTotalTablets += total;
      }

      const minGodownStrips = Math.round(minGodownTotalTablets / tabletsPerStrip);
      const maxGodownStrips = Math.round(maxGodownTotalTablets / tabletsPerStrip);
      const minRetailStrips = Math.round(minRetailTotalTablets / tabletsPerStrip);
      const maxRetailStrips = Math.round(maxRetailTotalTablets / tabletsPerStrip);

      await Medicine.findByIdAndUpdate(item._id, {
        $set: {
          "minimumStockCount.godown": minGodownStrips,
          "maximumStockCount.godown": maxGodownStrips,
          "minimumStockCount.retails": minRetailStrips,
          "maximumStockCount.retails": maxRetailStrips,
        },
      });

      updatedMedicineIds.push(item._id.toString());
    }

    // 2. Set zero for rest of the medicines
    await Medicine.updateMany(
      { _id: { $nin: updatedMedicineIds } },
      {
        $set: {
          "minimumStockCount.godown": 0,
          "maximumStockCount.godown": 0,
          "minimumStockCount.retails": 0,
          "maximumStockCount.retails": 0,
        },
      }
    );

    cache.timestamp = Date.now();

    return NextResponse.json(
      {
        message: "Minimum and maximum stock counts updated successfully",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in stock update:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
