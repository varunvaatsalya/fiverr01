import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import Doctor from "../../models/Doctors";
import { verifyTokenWithLogout } from "../../utils/jwt";

function generateUID() {
  const prefix = "DR";
  const timestamp = Math.floor(Date.now() / 1000).toString(); // Current timestamp in seconds
  const uniqueID = `${prefix}${timestamp}`;
  return uniqueID;
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

  const decoded = await verifyTokenWithLogout(token.value);
  const userRole = decoded?.role;
  const userEditPermission = decoded?.editPermission;
  if (!decoded || !userRole) {
    let res = NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
    res.cookies.delete("authToken");
    return res;
  }
  if (userRole !== "admin" && userRole !== "owner" && userRole !== "salesman") {
    return NextResponse.json(
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }
  const name = req.nextUrl.searchParams.get("name");

  try {
    let doctors;
    if (name === "1") {
      doctors = await Doctor.find({}, "_id name");
    } else {
      doctors = await Doctor.find()
        .sort({ _id: -1 })
        .populate("department", "name _id");
    }

    return NextResponse.json(
      { doctors, userRole, userEditPermission, success: true },
      { status: 200 }
    );
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
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }
  const { name, email, specialty, charge, department } = await req.json();

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
      charge,
      department,
      drid,
    });

    // Save user to the database
    await newDoctor.save();

    const updatedNewDoctor = await Doctor.findById(newDoctor._id).populate({
      path: "department",
      select: "name",
    });

    // Send response with UID
    return NextResponse.json(
      { doctor: updatedNewDoctor, success: true },
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
  if (userRole !== "admin" && userRole !== "salesman") {
    return NextResponse.json(
      { message: "Access denied. Admins only.", success: false },
      { status: 403 }
    );
  }

  const { _id, name, email, specialty, charge, department } = await req.json();

  try {
    // Check if patient exists
    const existingDoctor = await Doctor.findById(_id);
    if (!existingDoctor) {
      return NextResponse.json(
        { message: "Doctor not found", success: false },
        { status: 404 }
      );
    }

    // Update patient details
    existingDoctor.name = name;
    existingDoctor.email = email;
    existingDoctor.specialty = specialty;
    existingDoctor.charge = charge;
    existingDoctor.department = department;

    // Save updated patient to the database
    await existingDoctor.save();

    const updatedNewDoctor = await Doctor.findById(existingDoctor._id).populate(
      {
        path: "department",
        select: "name",
      }
    );

    // Send response with updated patient details
    return NextResponse.json(
      { doctor: updatedNewDoctor, success: true },
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
