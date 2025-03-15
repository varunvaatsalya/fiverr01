import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyToken } from "../../utils/jwt";
import Doctor from "../../models/Doctors";
import Department from "../../models/Departments";
import Prescription from "../../models/Prescriptions";
import {Expense} from "../../models/Expenses";

function getDates() {
  const now = new Date();
  const startIST = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0
  );

  const endIST = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );

  const startUTC = new Date(startIST.getTime());
  const endUTC = new Date(endIST.getTime());
  return { startUTC, endUTC };
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

  const decoded = await verifyToken(token.value);
  const userRole = decoded.role;
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
    const doctors = await Doctor.find({}, "_id name department").exec();
    const departments = await Department.find({}, "_id name").exec();

    let { startUTC, endUTC } = getDates();
    console.log("Start UTC:", startUTC);
    console.log("End UTC:", endUTC);

    const expenses = await Expense.find({
      createdAt: {
        $gte: startUTC,
        $lt: endUTC,
      },
    }).select("name amount");

    const prescriptions = await Prescription.find({
      createdAt: {
        $gte: startUTC,
        $lt: endUTC, // Until the start of tomorrow
      },
    })
      .select("-patient -tests") // Exclude the patient field entirely
      .populate({
        path: "doctor",
        select: "name specialty",
      })
      .populate({
        path: "department",
        select: "name",
      });

    return NextResponse.json(
      {
        prescriptions,
        expenses,
        departments,
        doctors,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching data:", error);
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
  if (userRole !== "admin" && userRole !== "owner" && userRole !== "salesman") {
    return NextResponse.json(
      { message: "Access denied. Admins only.", success: false },
      { status: 403 }
    );
  }
  // const { startDate, startTime, endDate, endTime } = await req.json();
  const { startDateTime, endDateTime } = await req.json();

  try {
    let { endUTC } = getDates();
    const now = new Date();
    const firstDateIST = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0
    );

    function getUTCDateTime(dateTime) {
      return new Date(dateTime);
    }

    let start = startDateTime ? getUTCDateTime(startDateTime) : firstDateIST;

    let end = endDateTime ? getUTCDateTime(endDateTime) : endUTC;

    console.log("Start:", startDateTime, start);
    console.log("End:", endDateTime, end);
    let dateQuery = {
      createdAt: {
        $gte: start,
        $lt: end,
      },
    };
    console.log("Date query:", dateQuery);
    const prescriptions = await Prescription.find(dateQuery)
      .select("-patient -tests")
      .populate({
        path: "doctor",
        select: "name specialty",
      })
      .populate({
        path: "department",
        select: "name",
      });

    const expenses = await Expense.find(dateQuery).select("name amount");

    // Send response with UID
    return NextResponse.json(
      { prescriptions, expenses, success: true },
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
