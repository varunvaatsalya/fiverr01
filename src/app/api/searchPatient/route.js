import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import Patient from "../../models/Patients";
import { verifyToken } from "../../utils/jwt";

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

  const { query } = await req.json();

  try {
    const isNumeric = !isNaN(query);
    const queryObj = isNumeric
    ? {
        $or: [
          { mobileNumber: Number(query) },
          { aadharNumber: Number(query) },
        ],
      }
    : {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { fatherName: { $regex: query, $options: "i" } },
          { uhid: { $regex: query, $options: "i" } },
        ],
      };

    const searchedPatient = await Patient.find(queryObj, "_id name uhid")
      .sort({ _id: -1 })
      .exec();

    return NextResponse.json(
      { patients: searchedPatient, success: true },
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
