import { NextResponse } from "next/server";
import dbConnect from "../../../lib/Mongodb";
import { verifyTokenWithLogout } from "../../../utils/jwt";
import PharmacyInvoice from "../../../models/PharmacyInvoice";
import Medicine from "../../../models/Medicine";

export async function GET(req) {
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

  const now = new Date();
  const startDate = new Date();
  startDate.setMonth(now.getMonth() - 12);

  try {
    const monthlySales = await PharmacyInvoice.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: now },
          isDelivered: { $ne: null },
        },
      },
      { $unwind: "$medicines" },
      { $unwind: "$medicines.allocatedStock" },
      {
        $addFields: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
      },
      {
        $group: {
          _id: {
            medicineId: "$medicines.medicineId",
            year: "$year",
            month: "$month",
          },
          totalStrips: { $sum: "$medicines.allocatedStock.quantity.strips" },
        },
      },
      {
        $group: {
          _id: "$_id.medicineId",
          monthlyData: {
            $push: {
              year: "$_id.year",
              month: "$_id.month",
              strips: "$totalStrips",
            },
          },
        },
      },
      {
        $lookup: {
          from: "medicines",
          localField: "_id",
          foreignField: "_id",
          as: "medicineDetails",
        },
      },
      { $unwind: "$medicineDetails" },
      {
        $project: {
          medId: "$_id",
          name: "$medicineDetails.name",
          stripsPerBox: "$medicineDetails.packetSize.strips",
          monthlyData: 1,
        },
      },
    ]);

    await Promise.all(
      monthlySales.map(async (medicine) => {
        const { medId, stripsPerBox, monthlyData } = medicine;
  
        monthlyData.sort((a, b) => {
          const da = new Date(a.year, a.month - 1);
          const db = new Date(b.year, b.month - 1);
          return db - da;
        });
  
        const monthlyStrips = Array(12).fill(0);
        for (let m of monthlyData) {
          const index =
            (new Date().getFullYear() - m.year) * 12 +
            (new Date().getMonth() - (m.month - 1));
          if (index >= 0 && index < 12) monthlyStrips[index] = m.strips;
        }
  
        const avg = (n) => {
          const total = monthlyStrips.slice(0, n).reduce((a, b) => a + b, 0);
          // return Math.ceil(total / n / (stripsPerBox || 1));
          return total;
        };
  
        await Medicine.findByIdAndUpdate(
          medId,
          {
            $set: {
              avgMonthlyBoxes: {
                "1m": avg(1),
                "2m": avg(2),
                "3m": avg(3),
                "6m": avg(6),
                "12m": avg(12),
                savedAt: new Date(),
              },
            },
          },
          { new: false }
        );
      })
    );
    

    return NextResponse.json(
      {
        message: "Average monthly sales updated Successfully!",
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
