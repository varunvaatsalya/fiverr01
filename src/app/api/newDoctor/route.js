import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import Doctor from "../../models/Doctors";
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
  if (userRole !== "admin"&&userRole !== "owner") {
    return NextResponse.json(
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }

  try {
    const doctors = await Doctor.find().sort({ _id: -1 }).populate('department', 'name _id');
    return NextResponse.json({ doctors, userRole, userEditPermission, success: true }, { status: 200 });
  } catch (error) {
    console.error("Error fetching doctors:", error);
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
  if (userRole !== "admin") {
    return NextResponse.json(
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }
  const { name, email, specialty, department } = await req.json();

  try {
    // Check if email is unique
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return NextResponse.json(
        { message: "Email already exists", success: false },
        { status: 400 }
      );
    }

    // Generate a 6-digit UID
    const drid = generateUID();
    // console.log(departmentId)

    // Create new user
    const newDoctor = new Doctor({
      name,
      email,
      specialty,
      department,
      drid,
    });

    // Save user to the database
    await newDoctor.save();

    // Send response with UID
    return NextResponse.json(
      { doctor: newDoctor, success: true },
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
