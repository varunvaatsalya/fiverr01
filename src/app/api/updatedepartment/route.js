import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyToken } from "../../utils/jwt";
import Department from "../../models/Departments";

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

    const decoded = await verifyToken(token.value);
    const userRole = decoded.role;
    if (!decoded || !userRole) {
      return NextResponse.json(
        { message: "Invalid token.", success: false },
        { status: 403 }
      );
    }
    if (userRole !== "admin") {
      return NextResponse.json(
        { message: "Access denied. Admins only.", success: false },
        { status: 403 }
      );
    }

  const { name, items, _id } = await req.json();

  try {
    const updatedDepartment = await Department.findByIdAndUpdate(
      _id,
      { name, items },
      { new: true }
    );

    if (!updatedDepartment) {
      return NextResponse.json(
        { message: "Department not found", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        updatedDepartment,
        message: "Department updated successfully",
        success: true,
      },
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
