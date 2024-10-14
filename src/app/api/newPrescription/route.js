import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import Patient from "../../models/Patients";
import Doctor from "../../models/Doctors";
import Department from "../../models/Departments";
import Prescription from "../../models/Prescriptions";
import { verifyToken } from "../../utils/jwt";

function generateUID() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function GET(req) {
  await dbConnect();
  const patient = req.nextUrl.searchParams.get("patient");
  const componentDetails = req.nextUrl.searchParams.get("componentDetails");
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
    // const query = patient ? { patient } : {};

    if (patient) {
      // const prescriptions = await Prescription.find({ patient });
      const prescriptions = await Prescription.find({ patient })
        .populate({
          path: "doctor", // Populate the doctor field
          select: "name", // Only select the name of the doctor
        })
        .populate({
          path: "department", // Populate the department field
          select: "name", // Only select the name of the department
        })
        .select("-patient") // Exclude the patient details
        .exec();
      return NextResponse.json(
        { prescriptions, success: true },
        { status: 200 }
      );
    } else if (componentDetails == "1") {
      // const prescriptions = await Prescription.find({ patient });
      const patients = await Patient.find({}, "_id name uhid").exec();

      // Fetch all doctors with only _id, name, and associated department ID
      const doctors = await Doctor.find({}, "_id name department").exec();

      // Fetch all departments with _id, name, and items with prices
      const departments = await Department.find({}, "_id name items").exec();

      return NextResponse.json(
        {
          patients,
          doctors,
          departments,
          success: true,
        },
        { status: 200 }
      );
    }

    const allPrescription = await Prescription.find()
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
      { allPrescription, success: true },
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
  const { patient, items, doctor, department, paymentMode } = await req.json();

  try {
    // Check if email is unique
    console.log(patient, items, doctor, department);

    // // Generate a 6-digit UID
    const pid = generateUID();
    // // console.log(departmentId)

    // // Create new user
    const newPrescription = new Prescription({
      patient,
      items,
      doctor,
      department,
      pid,
      paymentMode,
    });

    // // Save user to the database
    await newPrescription.save();
    // Send response with UID
    return NextResponse.json(
      {
        newPrescription,
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
