import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import Users from "../../models/Users";
import RoleLogout from "../../models/RoleLogouts";
import { verifyTokenWithLogout } from "../../utils/jwt";

export async function GET(req) {
  await dbConnect();
  // const userId1 = req.headers.get("x-user-id");
  // const userRole1 = req.headers.get("x-user-role");

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
  if (userRole !== "admin") {
    return NextResponse.json(
      { message: "Access denied. Admins only.", success: false },
      { status: 403 }
    );
  }

  try {
    let logs = await RoleLogout.find();

    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

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
  if (userRole !== "admin") {
    return NextResponse.json(
      { message: "Access denied. Admins only.", success: false },
      { status: 403 }
    );
  }
  const { role } = await req.json();

  try {
    // Check if email is unique
    if (!role) {
      return NextResponse.json(
        { success: false, message: "Role required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const updatedDoc = await RoleLogout.findOneAndUpdate(
      { role },
      { lastLogoutAt: new Date() },
      { upsert: true, new: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: `Logged out all ${role}s`,
        updatedDoc,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
