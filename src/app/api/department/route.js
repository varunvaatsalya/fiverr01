import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyToken } from "../../utils/jwt";
import Department from "../../models/Departments";

function generateUID() {
  const prefix = "DT";
  const timestamp = Math.floor(Date.now() / 1000).toString(); // Current timestamp in seconds
  const uniqueID = `${prefix}${timestamp}`;
  return uniqueID;
}

export async function GET(req) {
  await dbConnect();
  const name = req.nextUrl.searchParams.get("name");
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
    if (userRole !== "admin" && userRole !== "owner") {
      return NextResponse.json(
        { message: "Access denied. admins only.", success: false },
        { status: 403 }
      );
    }

  try {
    let departments;
    if (name === "1") {
      departments = await Department.find({}, "_id name");
    } else {
      departments = await Department.find().sort({ _id: -1 });
    }
    return NextResponse.json({ departments, userRole, userEditPermission, success: true }, { status: 200 });
  } catch (error) {
    console.error("Error fetching departments:", error);
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

  const { name, items } = await req.json();

  try {
    const existingDepartment = await Department.findOne({ name });
    if (existingDepartment) {
      return NextResponse.json(
        { message: "Department already exists", success: false },
        { status: 200 }
      );
    }

    // Generate a 6-digit UID
    const uid = generateUID();

    // Create new user
    const newDepartment = new Department({
      name,
      items,
      uid,
    });

    // Save user to the database
    await newDepartment.save();

    // Send response with UID
    return NextResponse.json({ department: newDepartment, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
