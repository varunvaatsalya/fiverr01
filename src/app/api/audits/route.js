import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyTokenWithLogout } from "../../utils/jwt";
import AuditTrail from "@/app/models/AuditTrail";

function generateUID() {
  const prefix = "DT";
  const timestamp = Math.floor(Date.now() / 1000).toString(); // Current timestamp in seconds
  const uniqueID = `${prefix}${timestamp}`;
  return uniqueID;
}

export async function GET(req) {
  await dbConnect();
  let page = req.nextUrl.searchParams.get("page");
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
  if (userRole !== "admin" && userRole !== "owner") {
    return NextResponse.json(
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }

  try {
    page = parseInt(page || "1");
    const limit = 50;
    const skip = (page - 1) * limit;

    const audits = await AuditTrail.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("editedBy", "name email");

    const totalCount = await AuditTrail.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json(
      { audits, totalPages, success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
