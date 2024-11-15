import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyToken } from "../../utils/jwt";
import Doctor from "../../models/Doctors";
import Department from "../../models/Departments";
import Prescription from "../../models/Prescriptions";
import Expense from "../../models/Expenses";

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
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to the start of the day (00:00:00)

    const ISTOffset = 5.5 * 60 * 60 * 1000; 
    const todayIST = new Date(today.getTime() + ISTOffset);

    const tomorrowIST = new Date(todayIST); 
    tomorrowIST.setDate(todayIST.getDate() + 1);

    const expenses = await Expense.find({
      createdAt: {
        $gte: todayIST, // From the start of today
        $lt: tomorrowIST, // Until the start of tomorrow
      },
    }).select("name amount");;

    // Query to find prescriptions created today
    const prescriptions = await Prescription.find({
      createdAt: {
        $gte: todayIST, // From the start of today
        $lt: tomorrowIST, // Until the start of tomorrow
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
  if (userRole !== "admin" && userRole !== "owner" && userRole !== "salesman") {
    return NextResponse.json(
      { message: "Access denied. Admins only.", success: false },
      { status: 403 }
    );
  }
  const { startDate, startTime, endDate, endTime } = await req.json();

  try {
    let start = startDate && startTime ? new Date(`${startDate}T${startTime}`) : null;
    let end = endDate && endTime ? new Date(`${endDate}T${endTime}`) : null;

    // Default today's date if date not provided but time is there
    if (startTime && !startDate) {
      const today = new Date().toISOString().split("T")[0]; // Get today's date in yyyy-mm-dd format
      start = new Date(`${today}T${startTime}`);
    }
    if (endTime && !endDate) {
      const today = new Date().toISOString().split("T")[0];
      end = new Date(`${today}T${endTime}`);
    }

    let dateQuery = {};
    if (start && end) {
      dateQuery = { createdAt: { $gte: start, $lte: end } };
    } else if (start) {
      dateQuery = { createdAt: { $gte: start } };
    } else if (end) {
      dateQuery = { createdAt: { $lte: end } };
    }

    // Fetch data with filters

    const prescriptions = await Prescription.find(dateQuery)
    .select("-patient -tests") // Exclude the patient field entirely
    .populate({
      path: "doctor",
      select: "name specialty",
    })
    .populate({
      path: "department",
      select: "name",
    });
    
    // Fetch the expenses based on the date range
    const expenses = await Expense.find(dateQuery).select("name amount");;

    
    // Send response with UID
    return NextResponse.json({ prescriptions, expenses, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
