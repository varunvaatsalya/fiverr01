import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyTokenWithLogout } from "../../utils/jwt";
import Prescription from "../../models/Prescriptions";
import Doctor from "../../models/Doctors";
import Department from "../../models/Departments";

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
  const startDateTime = req.nextUrl.searchParams.get("startDateTime");
  const endDateTime = req.nextUrl.searchParams.get("endDateTime");

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
  if (userRole !== "admin") {
    return NextResponse.json(
      { message: "Access denied. Admins only.", success: false },
      { status: 403 }
    );
  }
  // const { startDateTime, endDateTime } = await req.json();

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

    let dateQuery = {
      createdAt: {
        $gte: start,
        $lt: end,
      },
    };
    const prescriptions = await Prescription.find(dateQuery)
      .select("patient price department items paymentMode")
      .populate({
        path: "patient",
        select: "name pid",
      })
      .populate({
        path: "department",
      });

    const doctors = await Doctor.find({}, "_id name department").exec();
    const departments = await Department.find({}, "_id name items").exec();
    // Send response with UID
    return NextResponse.json(
      { prescriptions, doctors, departments, success: true },
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
  if (userRole !== "admin") {
    return NextResponse.json(
      { message: "Access denied. Admins only.", success: false },
      { status: 403 }
    );
  }
  const { prescriptionIds, discountPercentage } = await req.json();

  try {
    if (
      !prescriptionIds ||
      !Array.isArray(prescriptionIds) ||
      prescriptionIds.length === 0
    ) {
      return NextResponse.json(
        { message: "Invalid prescription IDs!", success: false },
        { status: 400 }
      );
    }
    if (!discountPercentage || discountPercentage <= 0) {
      return NextResponse.json(
        { message: "Invalid discount percentage!", success: false },
        { status: 400 }
      );
    }

    const prescriptions = await Prescription.find({
      _id: { $in: prescriptionIds },
    });
    for (let prescription of prescriptions) {
      prescription.price.discount =
        (prescription.price.subtotal * discountPercentage) / 100;
      prescription.price.total =
        prescription.price.subtotal - prescription.price.discount;
      await prescription.save();
    }

    return NextResponse.json(
      { message: "Discount applied successfully!", success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
