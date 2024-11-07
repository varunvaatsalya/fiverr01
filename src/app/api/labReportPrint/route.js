import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import Prescription from "../../models/Prescriptions";
import { verifyToken } from "../../utils/jwt";


export async function GET(req) {
  await dbConnect();
  const id = req.nextUrl.searchParams.get("id");

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

  try {
      

    const prescriptionDetails = await Prescription.findById(id)
      .sort({ _id: -1 })
      .populate({
        path: "patient", // Populate the department field
        select: "name uhid address age gender mobileNumber",
      })
      .populate({
        path: "doctor", // Populate the department field
        select: "name specialty",
      })
      .populate({
        path: "tests.test",
        select: "name ltid items",
      })
      .populate({
        path: "department", // Populate the department field
        select: "name",
      });

      if (prescriptionDetails) {
        prescriptionDetails.tests = prescriptionDetails.tests.filter(test => test.isCompleted);
      }

    return NextResponse.json(
      { prescriptionDetails, success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}