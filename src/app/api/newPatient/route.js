import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import Patient from "../../models/Patients";
import Prescription from "../../models/Prescriptions";
import { verifyToken } from "../../utils/jwt";

function generateUID() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function GET(req) {
  await dbConnect();
  // const token = req.cookies.get("authToken");
  // if (!token) {
  //   console.log("Token not found. Redirecting to login.");
  //   return NextResponse.json(
  //     { message: "Access denied. No token provided.", success: false },
  //     { status: 401 }
  //   );
  // }

  // const decoded = await verifyToken(token.value);
  // const userRole = decoded.role;
  // if (!decoded || !userRole) {
  //   return NextResponse.json(
  //     { message: "Invalid token.", success: false },
  //     { status: 403 }
  //   );
  // }
  // if (userRole !== "Admin") {
  //   return NextResponse.json(
  //     { message: "Access denied. Admins only.", success: false },
  //     { status: 403 }
  //   );
  // }

  try {
    const patients = await Patient.find();
    return NextResponse.json({ patients, success: true }, { status: 200 });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  await dbConnect();
  // const token = req.cookies.get("authToken");
  // if (!token) {
  //   console.log("Token not found. Redirecting to login.");
  //   return NextResponse.json(
  //     { message: "Access denied. No token provided.", success: false },
  //     { status: 401 }
  //   );
  // }

  // const decoded = await verifyToken(token.value);
  // const userRole = decoded.role;
  // if (!decoded || !userRole) {
  //   return NextResponse.json(
  //     { message: "Invalid token.", success: false },
  //     { status: 403 }
  //   );
  // }
  // if (userRole !== "Admin") {
  //   return NextResponse.json(
  //     { message: "Access denied. Admins only.", success: false },
  //     { status: 403 }
  //   );
  // }
  const { name, age, gender, mobileNumber, aadharNumber, address } =
    await req.json();

  try {
    // Check if email is unique
    const existingPatient = await Patient.find({
      $or: [{ mobileNumber }, { aadharNumber }],
    });
    if (existingPatient.length > 0) {
      return NextResponse.json(
        { message: "Patient already exists", success: false },
        { status: 400 }
      );
    }

    // Generate a 6-digit UID
    const uhid = generateUID();
    // console.log(departmentId)

    // Create new user
    const newPatient = new Patient({
      name,
      age,
      gender,
      mobileNumber,
      aadharNumber,
      address,
      uhid,
    });

    // Save user to the database
    await newPatient.save();
    // Send response with UID
    return NextResponse.json(
      { patient: newPatient, success: true },
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
