import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import Prescription from "../../models/Prescriptions";
import { verifyTokenWithLogout } from "../../utils/jwt";

export async function GET(req) {
  await dbConnect();
  const id = req.nextUrl.searchParams.get("id");
  const token = req.cookies.get("authToken");
  if (!token) {
    console.log("Token not found. Redirecting to login.");
    return NextResponse.json(
      { message: "Access denied. No token provided." , success: false },
      { status: 401 }
    );
  }

  const decoded = await verifyTokenWithLogout(token.value);
  const userRole = decoded?.role;
  if (!decoded || !userRole) {
    return NextResponse.json(
      { message: "Invalid token." , success: false },
      { status: 403 }
    );
  }
  if (userRole !== "admin") {
    return NextResponse.json(
      { message: "Access denied. Admins only." , success: false },
      { status: 403 }
    );
  }

  try {
    const updatedPrescription = await Prescription.findByIdAndUpdate(
      id,
      { isPrint: true },
      { new: true }
    );

    if (!updatedPrescription) {
      return NextResponse.json(
        { message: "Prescription not found", success: false },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { id: updatedPrescription._id, success: true },
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
