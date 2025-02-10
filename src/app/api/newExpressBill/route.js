import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyToken } from "../../utils/jwt";
import PharmacyExpress from "../../models/PharmacyExpress";
import Patient from "../../models/Patients";

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

    const allExpressBill = await PharmacyExpress.find()
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "patientId", // Populate the department field
        select: "_id name uhid",
      })
      .populate({
        path: "medicines.medicineId", // Populate the department field
        select: "name _id packetSize isTablets",
        populate: {
          path: "salts",
          select: "_id name",
        },
      });
    const totalPharmacyExpressInvoices = await PharmacyExpress.countDocuments();

    return NextResponse.json(
      {
        allExpressBill,
        userRole,
        totalPages: Math.ceil(totalPharmacyExpressInvoices / limit),
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
  if (userRole !== "admin" && userRole !== "salesman" && userRole !== "nurse") {
    return NextResponse.json(
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }
  const { patientId, medicines } = await req.json();

  try {
    let patient = await Patient.findById(patientId);
    if (!patient) {
      return NextResponse.json(
        {
          message: "Patient not found",
          success: false,
        },
        { status: 404 }
      );
    }
    // let

    const NewExpressInvoice = new PharmacyExpress({
      patientId,
      medicines,
    });

    await NewExpressInvoice.save();

    const updatedNewExpressInvoice = await PharmacyExpress.findById(
      NewExpressInvoice._id
    )
      .populate({
        path: "patientId", // Populate the department field
        select: "_id name uhid",
      })
      .populate({
        path: "medicines.medicineId", // Populate the department field
        select: "name _id packetSize isTablets",
        populate: {
          path: "salts",
          select: "_id name",
        },
      });

    // Send response with UID
    return NextResponse.json(
      {
        newExpressInvoice: updatedNewExpressInvoice,
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
    const deletedPharmacyExpressInvoice =
      await PharmacyExpress.findByIdAndDelete(id);
    if (!deletedPharmacyExpressInvoice) {
      return NextResponse.json(
        { message: "Invoice not found", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Invoice deleted successfully", success: true },
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
