import dbConnect from "@/app/lib/Mongodb";
import { Stock } from "@/app/models";
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
    const stockData = await Stock.aggregate([
      {
        $lookup: {
          from: "medicines",
          localField: "medicine",
          foreignField: "_id",
          as: "medicine",
        },
      },
      {
        $unwind: "$medicine",
      },
      {
        $project: {
          _id: 1,
          "medicine.name": 1,
          "medicine.packetSize": 1,
          batchName: 1,
          expiryDate: 1,
          mfgDate: 1,
          quantity: 1,
        },
      },
      {
        $sort: {
          "medicine.name": 1,
        },
      },
    ]);

    return NextResponse.json({ stockData, success: true }, { status: 200 });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
