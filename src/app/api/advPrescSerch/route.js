import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import Prescription from "../../models/Prescriptions";
import { verifyTokenWithLogout } from "../../utils/jwt";
import Patients from "../../models/Patients";

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
  if (userRole !== "admin" && userRole !== "owner" && userRole !== "salesman") {
    return NextResponse.json(
      { message: "Access denied. Admins only.", success: false },
      { status: 403 }
    );
  }
  const { department, doctor, endDate, patientName, pid, startDate, uhid } =
    await req.json();

  try {
    const query = {};
    const pateintQuery = {};

    // Add filters dynamically
    if (uhid) {
      pateintQuery["uhid"] = { $regex: `^${uhid}`, $options: "i" };
    }

    if (patientName) {
      pateintQuery["name"] = { $regex: patientName, $options: "i" }; // Case-insensitive search
    }

    const matchingPatients = await Patients.find(pateintQuery).select("_id");
    const patientIds = matchingPatients.map((patient) => patient._id);
    query["patient"] = { $in: patientIds };

    if (doctor) {
      query["doctor"] = doctor;
    }

    if (department) {
      query["department"] = department;
    }

    if (pid) {
      query["pid"] = { $regex: `^${pid}`, $options: "i" };
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Fetch data with filters
    const prescriptions = await Prescription.find(query)
      .sort({ _id: -1 })
      .limit(150)
      .populate({
        path: "patient", // Populate the department field
        select: "name uhid address age gender mobileNumber",
      })
      .populate({
        path: "doctor", // Populate the department field
        select: "name specialty",
      })
      .populate({
        path: "tests.test",
        select: "name",
      })
      .populate({
        path: "department", // Populate the department field
        select: "name",
      })
      .populate({
        path: "createdBy",
        select: "name email",
      })
      .select("-tests.results");
    // Send response with UID
    return NextResponse.json({ prescriptions, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
