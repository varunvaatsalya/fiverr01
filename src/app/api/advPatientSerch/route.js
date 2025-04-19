import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import Patient from "../../models/Patients";
import { verifyTokenWithLogout } from "../../utils/jwt";

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
  const {
    aadharNumber,
    ageFrom,
    ageTo,
    endDate,
    endTime,
    fathersName,
    gender,
    mobileNumber,
    name,
    startDate,
    startTime,
    uhid,
  } = await req.json();

  try {
    const query = {};

    // Add filters dynamically
    if (uhid) {
      query["uhid"] = { $regex: `^${uhid}`, $options: "i" };
    }

    if (name) {
      query["name"] = { $regex: name, $options: "i" }; // Case-insensitive search
    }
    if (fathersName) {
      query["fathersName"] = { $regex: fathersName, $options: "i" }; // Case-insensitive search
    }

    if (gender) {
      query["gender"] = gender;
    }

    if (mobileNumber) {
      query["mobileNumber"] = mobileNumber;
    }
    if (aadharNumber) {
      query["aadharNumber"] = aadharNumber;
    }

    if (ageFrom || ageTo) {
      query.age = {};
      if (ageFrom) query.age.$gte = parseInt(ageFrom); // Age greater than or equal to ageFrom
      if (ageTo) query.age.$lte = parseInt(ageTo); // Age less than or equal to ageTo
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
    const patients = await Patient.find(query)
      .sort({ _id: -1 })
      .limit(200)
      .populate({
        path: "createdBy",
        select: "name email",
      });
    // Send response with UID
    return NextResponse.json({ patients, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
