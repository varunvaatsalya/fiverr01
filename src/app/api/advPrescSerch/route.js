import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import Prescription from "../../models/Prescriptions";
import { verifyToken } from "../../utils/jwt";

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
  if (userRole !== "admin" && userRole !== "owner" && userRole !== "salesman") {
    return NextResponse.json(
      { message: "Access denied. Admins only.", success: false },
      { status: 403 }
    );
  }
  const {
    department,
    doctor,
    endDate,
    endTime,
    patientName,
    pid,
    startDate,
    startTime,
    uhid,
  } = await req.json();

  try {
    const query = {};

    // Add filters dynamically
    if (uhid) {
      query["patient.uhid"] = { $regex: `^${uhid}`, $options: "i" };
    }

    if (patientName) {
      query["patient.name"] = { $regex: patientName, $options: "i" }; // Case-insensitive search
    }

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
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // If only time is provided, use today's date with the given time range
    if (!startDate && !endDate && (startTime || endTime)) {
      const today = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

      query.createdAt = {
        $gte: new Date(`${today}T${startTime || "00:00"}`),
        $lte: new Date(`${today}T${endTime || "23:59"}`),
      };
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
      .select("-tests.results");
    // Send response with UID
    return NextResponse.json(
      { prescriptions, success: true },
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
