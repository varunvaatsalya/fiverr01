import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import DataEntry from "../../models/DataEntrys";
import Patient from "../../models/Patients";
import Doctor from "../../models/Doctors";
import Department from "../../models/Departments";
import Prescription from "../../models/Prescriptions";
import LabTest from "../../models/LabTests";
import { verifyToken } from "../../utils/jwt";

export async function GET(req) {
  await dbConnect();
  let page = req.nextUrl.searchParams.get("page");

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

  try {
    page = parseInt(page) || 1;
    const limit = 50; // Number of prescriptions per page
    const skip = (page - 1) * limit;

    const allDataEntry = await DataEntry.find()
      .skip(skip)
      .limit(limit)
      .populate({
        path: "patient", // Populate the department field
        select: "name uhid address age gender mobileNumber",
      })
      .populate({
        path: "doctor", // Populate the department field
        select: "name specialty",
      })
      .populate({
        path: "department", // Populate the department field
        select: "name",
      });

    return NextResponse.json(
      {
        allDataEntry,
        userRole,
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

  const decoded = await verifyToken(token.value);
  const userRole = decoded.role;
  if (!decoded || !userRole) {
    return NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
  }
  if (userRole !== "admin" && userRole !== "salesman"&& userRole !== "nurse") {
    return NextResponse.json(
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }
  const { patient, items, doctor, department } = await req.json();

  try {

    const newDataEntry = new DataEntry({
      patient,
      items,
      doctor,
      department,
    });
    
    await newDataEntry.save();

    const updatedNewDataEntry = await DataEntry.findById(
      newDataEntry._id
    )
      .populate({
        path: "patient",
        select: "name uhid address age gender mobileNumber",
      })
      .populate({
        path: "doctor",
        select: "name specialty",
      })
      .populate({
        path: "department",
        select: "name",
      });

    // Send response with UID
    return NextResponse.json(
      {
        newDataEntry: updatedNewDataEntry,
        success: true,
      },
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

export async function DELETE(req) {
  await dbConnect();
  const { id } = await req.json();

  try {
    const deletedDataEntry = await DataEntry.findByIdAndDelete(id);
    if (!deletedDataEntry) {
      return NextResponse.json(
        { message: "DataEntry not found", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "DataEntry deleted successfully", success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting admin:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
