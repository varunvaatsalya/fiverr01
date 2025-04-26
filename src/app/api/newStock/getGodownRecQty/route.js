import { NextResponse } from "next/server";
import dbConnect from "../../../lib/Mongodb";
import { verifyTokenWithLogout } from "../../../utils/jwt";
import Request from "../../../models/Request";
import mongoose from "mongoose";

export async function GET(req) {
  await dbConnect();
  let medicineId = req.nextUrl.searchParams.get("medicineId");

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

  if (!medicineId) {
    return NextResponse.json(
      { message: "medicineId is required" },
      { status: 400 }
    );
  }
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Request.aggregate([
      {
        $match: {
          medicine: new mongoose.Types.ObjectId(medicineId),
          status: { $in: ["Fulfilled", "Fulfilled (Partial)"] },
          approvedAt: { $gte: thirtyDaysAgo },
        },
      },
      { $unwind: "$approvedQuantity" },
      {
        $group: {
          _id: null,
          totalStrips: { $sum: "$approvedQuantity.quantity.totalStrips" },
        },
      },
      {
        $project: {
          _id: 0,
          totalStrips: 1,
        },
      },
    ]);

    return NextResponse.json(
      {
        recQty: result[0]?.totalStrips || 0,
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
