import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyToken } from "../../utils/jwt";
import Medicine from "../../models/Medicine";

export async function GET(req) {
  await dbConnect();
  let basicInfo = req.nextUrl.searchParams.get("basicInfo");

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
    let response = {};
    if (basicInfo === "1") {
      response = await Medicine.find()
        .sort({ name: 1 })
        .populate({
          path: "manufacturer",
        })
        .populate({
          path: "salts",
        })
        .select("-vendor -medicalRepresentator");
    }

    response = await Medicine.find()
      .sort({ name: 1 })
      .populate({
        path: "manufacturer",
      })
      .populate({
        path: "vendor",
      })
      .populate({
        path: "medicalRepresentator",
      })
      .populate({
        path: "salts",
      });

    return NextResponse.json(
      {
        response,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching details:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  // let manufacturer = req.nextUrl.searchParams.get("manufacturer");

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
  if (userRole !== "admin") {
    return NextResponse.json(
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }
  const {
    name,
    manufacturer,
    medicalRepresentator,
    packetSize,
    salts,
    vendor,
  } = await req.json();

  try {
    let medicine = new Medicine({
      name,
      manufacturer,
      medicalRepresentator,
      packetSize,
      salts,
      vendor,
    });
    await medicine.save();
    return NextResponse.json(
      { medicine, message: "Medicine Saved Successfully!", success: true },
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
