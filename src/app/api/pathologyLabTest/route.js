import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyTokenWithLogout } from "../../utils/jwt";
import LabTest from "../../models/LabTests";
import Department from "../../models/Departments";

function generateLTID() {
  const prefix = "LT";
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

  const decoded = await verifyTokenWithLogout(token.value);
  const userRole = decoded?.role;
  // const userEditPermission = decoded?.editPermission;
  if (!decoded || !userRole) {
    let res = NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
    res.cookies.delete("authToken");
    return res;
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
      pathologyLabTest = await LabTest.find({}, "_id ltid name price isExternalReport").sort({
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
  if (userRole !== "admin" && userRole !== "pathologist") {
    return NextResponse.json(
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }

  const { name, price, items, isExternalReport } = await req.json();

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
      isExternalReport: isExternalReport ?? false,
      ltid,
    });

    // Save user to the database
    await newLabTest.save();

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
  if (userRole !== "admin" && userRole !== "pathologist") {
    return NextResponse.json(
      { message: "Access denied. Admins only.", success: false },
      { status: 403 }
    );
  }

  const { id, name, price, items, isExternalReport } = await req.json();

  try {
    // Check if patient exists
    const existingLabTest = await LabTest.findById(id);
    if (!existingLabTest) {
      return NextResponse.json(
        { message: "Patient not found", success: false },
        { status: 404 }
      );
    }

    // Update patient details
    existingLabTest.name = name;
    existingLabTest.price = price;
    existingLabTest.items = items;
    existingLabTest.isExternalReport = isExternalReport ?? false;

    // Save updated patient to the database
    await existingLabTest.save();

    // Send response with updated patient details
    return NextResponse.json(
      { message: "Updated Succesfully", success: true },
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
