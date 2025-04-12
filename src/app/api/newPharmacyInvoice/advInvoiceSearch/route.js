import { NextResponse } from "next/server";
import dbConnect from "../../../lib/Mongodb";
import PharmacyInvoice from "../../../models/PharmacyInvoice";
import { verifyToken } from "../../../utils/jwt";
import Patients from "../../../models/Patients";

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
  console.log(decoded);
  const userRole = decoded.role;
  if (!decoded || !userRole) {
    return NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
  }

  const { patientName, uhid, startDate, endDate, inid, paymentMode, isReturn } =
    await req.json();

  try {
    const query = {};
    const pateintQuery = {};

    if (uhid) {
      pateintQuery["uhid"] = { $regex: `^${uhid}`, $options: "i" };
    }

    if (patientName) {
      pateintQuery["name"] = { $regex: patientName, $options: "i" }; // Case-insensitive search
    }

    const matchingPatients = await Patients.find(pateintQuery).select("_id");
    const patientIds = matchingPatients.map((patient) => patient._id);
    if (patientIds.length > 0) {
      query["patientId"] = { $in: patientIds };
    }
    if (inid) {
      query["inid"] = { $regex: `^${inid}`, $options: "i" };
    }

    if (paymentMode) {
      query["paymentMode"] = paymentMode;
    }
    if (isReturn) {
      query.returns = { $exists: true, $not: { $size: 0 } };
    }
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$lte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Fetch data with filters
    const invoices = await PharmacyInvoice.find(query)
      .sort({ _id: -1 })
      .limit(Object.keys(query).length === 0 ? 200 : undefined)
      .populate({
        path: "patientId",
        select: "name uhid address age gender mobileNumber",
      })
      .populate({
        path: "medicines.medicineId",
        select: "name salts isTablets medicineType packetSize rackPlace",
        populate: {
          path: "salts",
          select: "name",
        },
      })
      .populate({
        path: "createdBy",
        select: "name email",
      });

    // Send response with UID
    return NextResponse.json({ invoices, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
