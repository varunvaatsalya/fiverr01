import dbConnect from "@/app/lib/Mongodb";
import RetailStock from "@/app/models/RetailStock"
import { verifyTokenWithLogout } from "@/app/utils/jwt";
import { NextResponse } from "next/server";

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
  //   const userEditPermission = decoded?.editPermission;
  if (!decoded || !userRole) {
    let res = NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
    res.cookies.delete("authToken");
    return res;
  }
  //   if (userRole !== "admin" && userRole !== "owner" && userRole !== "salesman") {
  //     return NextResponse.json(
  //       { message: "Access denied. admins only.", success: false },
  //       { status: 403 }
  //     );
  //   }

  try {
    const retailStockData = await RetailStock.aggregate([
      { $unwind: "$stocks" },
      {
        $lookup: {
          from: "medicines",
          localField: "medicine",
          foreignField: "_id",
          as: "medicineData",
        },
      },
      { $unwind: "$medicineData" },
      {
        $lookup: {
          from: "manufacturers",
          localField: "medicineData.manufacturer",
          foreignField: "_id",
          as: "manufacturerData",
        },
      },
      { $unwind: "$manufacturerData" },
      {
        $group: {
          _id: "$medicine",
          medicineName: { $first: "$medicineData.name" },
          manufacturerName: { $first: "$manufacturerData.name" },
          totalStrips: { $sum: "$stocks.quantity.totalStrips" },
          totalBoxes: { $sum: "$stocks.quantity.boxes" },
        },
      },
      {
        $project: {
          _id: 0,
          medicineId: "$_id",
          medicineName: 1,
          manufacturerName: 1,
          totalStrips: 1,
          totalBoxes: 1,
        },
      },
      {
        $sort: { medicineName: 1 }, // 1 = ascending, -1 = descending
      },
    ]);

    return NextResponse.json({ retailStockData, success: true }, { status: 200 });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
