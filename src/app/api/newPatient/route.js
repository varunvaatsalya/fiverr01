import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import Patient from "../../models/Patients";
import { verifyTokenWithLogout } from "../../utils/jwt";
import { generateUniqueId } from "../../utils/counter";
import AuditTrail from "@/app/models/AuditTrail";

async function generateUID() {
  const prefix = "PT";
  // const timestamp = Math.floor(Date.now() / 1000).toString(); // Current timestamp in seconds
  const uniqueDigit = await generateUniqueId("patient");
  const uniqueID = `${prefix}${uniqueDigit}`;
  return uniqueID;
}

export async function GET(req) {
  let page = req.nextUrl.searchParams.get("page");
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

  try {
    page = parseInt(page) || 1;
    const limit = 40; // Number of prescriptions per page
    const skip = (page - 1) * limit;

    const patients = await Patient.find()
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "createdBy",
        select: "name email",
      });

    const totalPatient = await Patient.countDocuments();
    return NextResponse.json(
      {
        patients,
        totalPages: Math.ceil(totalPatient / limit),
        userRole,
        userEditPermission,
        success: true,
      },
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

  const decoded = await verifyTokenWithLogout(token.value);
  const userRole = decoded?.role;
  const userId = decoded._id;
  if (!decoded || !userRole) {
    let res = NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
    res.cookies.delete("authToken");
    return res;
  }
  if (userRole !== "admin" && userRole !== "salesman" && userRole !== "nurse") {
    return NextResponse.json(
      { message: "Access denied. Admins only.", success: false },
      { status: 403 }
    );
  }
  const {
    name,
    fathersName,
    age,
    gender,
    mobileNumber,
    aadharNumber,
    address,
  } = await req.json();

  try {
    const query = {
      $or: [
        {
          $and: [{ mobileNumber }, { name }],
        },
      ],
    };

    if (aadharNumber) {
      query.$or.push({ aadharNumber });
    }

    const existingPatient = await Patient.find(query);

    if (existingPatient.length > 0) {
      return NextResponse.json(
        { message: "Patient already exists", success: false },
        { status: 400 }
      );
    }

    const uhid = await generateUID();

    const newPatient = new Patient({
      name,
      fathersName,
      age,
      gender,
      mobileNumber,
      aadharNumber,
      address,
      uhid,
      createdBy: userRole === "admin" || !userId ? null : userId,
      createdByRole: userRole,
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

  const decoded = await verifyTokenWithLogout(token.value);
  const userRole = decoded?.role;
  const userId = decoded._id;
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

  const { _id, name, fathersName, age, gender, mobileNumber, aadharNumber, address, reason } =
    await req.json();

  try {
    // Check if patient exists
    const existingPatient = await Patient.findById(_id).populate({
      path: "createdBy",
      select: "name email",
    });
    if (!existingPatient) {
      return NextResponse.json(
        { message: "Patient not found", success: false },
        { status: 404 }
      );
    }
    const previousData = existingPatient.toObject();

    // Update patient details
    existingPatient.name = name;
    existingPatient.fathersName = fathersName;
    existingPatient.age = age;
    existingPatient.gender = gender;
    existingPatient.mobileNumber = mobileNumber;
    existingPatient.aadharNumber = aadharNumber;
    existingPatient.address = address;

    // Save updated patient to the database
    const audit = await AuditTrail.create({
      resourceType: "Patient",
      resourceId: existingPatient._id,
      editedByRole: userRole,
      editedBy: userRole === "admin" || !userId ? null : userId,
      changes: {
        before: previousData,
        after: existingPatient.toObject(),
      },
      remarks: reason,
    });

    // Push audit record _id into prescription's updates
    existingPatient.updates.push(audit._id);
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
