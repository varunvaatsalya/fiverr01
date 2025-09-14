import dbConnect from "@/app/lib/Mongodb";
import { Stock } from "@/app/models";
import { verifyTokenWithLogout } from "@/app/utils/jwt";
import { NextResponse } from "next/server";

export async function GET(req) {
  await dbConnect();

  let id = req.nextUrl.searchParams.get("id");

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
    const latestStock = await Stock.findOne({ medicine: id })
      .sort({
        createdAt: -1,
      })
      .select("batchName expiryDate initialQuantity purchasePrice sellingPrice createdAt");

    return NextResponse.json(
      {
        latestStock,
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
