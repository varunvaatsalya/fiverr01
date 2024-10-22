import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyToken } from "../../utils/jwt";
import LabTest from "../../models/LabTests";
import Department from "../../models/Departments";

function generateLTID() {
  const prefix = "LT";
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const uniqueID = `${prefix}${timestamp}`;
  return uniqueID;
}
function generateUID() {
  const prefix = "DT";
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const uniqueID = `${prefix}${timestamp}`;
  return uniqueID;
}

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
  const userEditPermission = decoded.editPermission;
  if (!decoded || !userRole) {
    return NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
  }
  if (userRole !== "admin" && userRole !== "pathologist") {
    return NextResponse.json(
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }

  try {
    let pathologyLabTest;
    if (id) {
      pathologyLabTest = await LabTest.findById(id);
    } else {
      pathologyLabTest = await LabTest.find({}, "_id ltid name price").sort({
        _id: -1,
      });
    }
    return NextResponse.json(
      { pathologyLabTest, success: true },
      { status: 200 }
    );
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
  if (userRole !== "admin" && userRole !== "pathologist") {
    return NextResponse.json(
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }

  const { name, price, items } = await req.json();

  try {
    const existingLabTest = await LabTest.findOne({ name });
    if (existingLabTest) {
      return NextResponse.json(
        { message: "LabTest already exists", success: false },
        { status: 200 }
      );
    }

    // Generate a 6-digit UID
    const ltid = generateLTID();

    // Create new user
    const newLabTest = new LabTest({
      name,
      price,
      items,
      ltid,
    });

    // Save user to the database
    await newLabTest.save();

    let existingDepartment = await Department.findOne({ name: "pathology" });
    if (!existingDepartment) {
      const uid = generateUID();
      existingDepartment = new Department({ uid, name: "pathology" });
    }
    existingDepartment.items.push({ name, price });
    await existingDepartment.save();

    // Send response with UID
    return NextResponse.json({ newLabTest, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
