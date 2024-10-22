import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyToken } from "../../utils/jwt";
import Doctor from "../../models/Doctors";
import User from "../../models/Users";
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
    const salesmen = await User.find({ role: "salesman" }, "_id name").exec();
    const doctors = await Doctor.find({}, "_id name department").exec();
    const departments = await Department.find({}, "_id name").exec();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to the start of the day (00:00:00)

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Set the time to the start of the next day

    const expenses = await Expense.find({
      createdAt: {
        $gte: today, // From the start of today
        $lt: tomorrow, // Until the start of tomorrow
      },
    })


    // Query to find prescriptions created today
    const prescriptions = await Prescription.find({
      createdAt: {
        $gte: today, // From the start of today
        $lt: tomorrow, // Until the start of tomorrow
      },
    })
      .select("-patient") // Exclude the patient field entirely
      .populate({
        path: "doctor",
        select: "name specialty",
      })
      .populate({
        path: "department",
        select: "name",
      });

    return NextResponse.json(
      { prescriptions, expenses, departments, salesmen, doctors, success: true },
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
