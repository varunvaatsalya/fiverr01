import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyToken } from "../../utils/jwt";
import LabTest from "../../models/LabTests";
import Prescription from "../../models/Prescriptions";
import Department from "../../models/Departments";

function generateTRID() {
  const prefix = "TR";
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const uniqueID = `${prefix}${timestamp}`;
  return uniqueID;
}

export async function GET(req) {
  await dbConnect();
    // const get = req.nextUrl.searchParams.get("get");

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

  try {
    const pathologyDept = await Department.findOne({
      name: "pathology",
    }).select("_id");

    if (!pathologyDept) {
      return NextResponse.json(
        { message: "Pathology Department Not Found", success: false },
        { status: 404 }
      );
    }

    // const prescriptions = await Prescription.find({
    //   department: pathologyDept._id,
    //   "tests.isCompleted": false,
    // })
    //   .sort({ _id: -1 })
    //   .populate({
    //     path: "patient", // Populate the department field
    //     select: "name uhid",
    //   })
    //   .select("patient tests");

    const prescriptions = await Prescription.find({
      department: pathologyDept._id,
      "tests.isCompleted": false,
    })
      .sort({ _id: -1 })
      .populate({
        path: "patient",
        select: "name uhid",
      })
      .populate({
        path: "tests.test",
        select: "name price",
      })
      .select("patient tests");

    const filteredPrescriptions = prescriptions.map((prescription) => ({
      ...prescription._doc, // Spread the prescription data
      tests: prescription.tests.filter((test) => !test.isCompleted), // Filter only incomplete tests
    }));

    return NextResponse.json(
      { pendingTests: filteredPrescriptions, success: true },
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

  const { testResults, selectedTest, selectedPrescription } = await req.json();
  console.log(testResults, selectedTest, selectedPrescription);
  try {
    const updatedPrescription = await Prescription.findOneAndUpdate(
      {
        _id: selectedPrescription,
        "tests.test": selectedTest,
      },
      {
        $set: {
          "tests.$.isCompleted": true, // Set the isCompleted flag to true for the specific test
          "tests.$.resultDate": Date.now(), // Set the isCompleted flag to true for the specific test
          "tests.$.results": testResults, // Save the new results array
        },
      },
      { new: true } // Return the updated document
    );

    if (updatedPrescription) {
      return NextResponse.json({ success: true }, { status: 201 });
    } else {
      return NextResponse.json(
        { message: "Internal server error", success: false },
        { status: 500 }
      );
    }

    // Send response with UID
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
