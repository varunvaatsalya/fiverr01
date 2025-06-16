import dbConnect from "@/app/lib/Mongodb";
import { verifyTokenWithLogout } from "@/app/utils/jwt";
import { NextResponse } from "next/server";
import LoginHistory from "@/app/models/LoginHistory";

export async function GET(req) {
  await dbConnect();

  let page = req.nextUrl.searchParams.get("page");
  const role = req.nextUrl.searchParams.get("role");
  const status = req.nextUrl.searchParams.get("status");

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
    page = parseInt(page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;

    const history = await LoginHistory.find(query)
      .sort({ loginTime: -1 })
      .skip(skip)
      .limit(limit);

    const totalHistory = await LoginHistory.countDocuments();

    return NextResponse.json(
      { history, totalPages: Math.ceil(totalHistory / limit), success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
