import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import Patient from "../../models/Patients";
import { verifyToken } from "../../utils/jwt";

function generateUID() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function GET(req) {
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
  const userEditPermission = decoded.editPermission;
  if (!decoded || !userRole) {
    return NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
  }

  try {
    const patients = await Patient.find().sort({ _id: -1 });
    return NextResponse.json(
      { patients, userRole, userEditPermission, success: true },
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
  if (userRole !== "admin" && userRole !== "salesman") {
    return NextResponse.json(
      { message: "Access denied. Admins only.", success: false },
      { status: 403 }
    );
  }
  const { name, age, gender, mobileNumber, aadharNumber, address } =
    await req.json();

  try {
    // Check if email is unique
    const existingPatient = await Patient.find({
      $or: [{ $and: [{ mobileNumber }, { name }] }, { aadharNumber }],
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

export async function PUT(req) {
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
  if (userRole !== "admin" && userRole !== "salesman") {
    return NextResponse.json(
      { message: "Access denied. Admins only.", success: false },
      { status: 403 }
    );
  }

  const { _id, name, age, gender, mobileNumber, aadharNumber, address } =
    await req.json();

  try {
    // Check if patient exists
    const existingPatient = await Patient.findById(_id);
    if (!existingPatient) {
      return NextResponse.json(
        { message: "Patient not found", success: false },
        { status: 404 }
      );
    }

    // Update patient details
    existingPatient.name = name;
    existingPatient.age = age;
    existingPatient.gender = gender;
    existingPatient.mobileNumber = mobileNumber;
    existingPatient.aadharNumber = aadharNumber;
    existingPatient.address = address;

    // Save updated patient to the database
    await existingPatient.save();

    // Send response with updated patient details
    return NextResponse.json(
      { patient: existingPatient, success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during update:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
