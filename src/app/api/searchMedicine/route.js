import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import Medicine from "../../models/Medicine";
import { verifyTokenWithLogout } from "../../utils/jwt";

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

  const { query } = await req.json();

  try {
    const searchedMedicine = await Medicine.find({
      name: { $regex: query, $options: "i" },
    })
      .select("name _id packetSize isTablets")
      .populate({
        path: "salts",
        select: "name _id",
      })
      .sort({ _id: -1 })
      .exec();
    return NextResponse.json(
      { medicines: searchedMedicine, success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
