import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyToken } from "../../utils/jwt";
import {
  Manufacturer,
  Vendor,
  MedicalRepresentator,
  Salt,
} from "../../models/MedicineMetaData";

export async function GET(req) {
  await dbConnect();
  let manufacturer = req.nextUrl.searchParams.get("manufacturer");
  let vendor = req.nextUrl.searchParams.get("vendor");
  let mr = req.nextUrl.searchParams.get("mr");
  let salts = req.nextUrl.searchParams.get("salts");

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
    const response = {};
    if (manufacturer == "1") {
      response.manufacturers = await Manufacturer.find().sort({ _id: -1 });
    }
    if (vendor == "1") {
      response.vendors = await Vendor.find().sort({ _id: -1 });
    }
    if (mr == "1") {
      response.mrs = await MedicalRepresentator.find().sort({ _id: -1 });
    }
    if (salts == "1") {
      response.salts = await Salt.find().sort({ _id: -1 });
    }
    // If no query parameters are provided, return all data
    if (!manufacturer && !vendor && !mr && !salts) {
      response.manufacturers = await Manufacturer.find().sort({ _id: -1 });
      response.vendors = await Vendor.find().sort({ _id: -1 });
      response.mrs = await MedicalRepresentator.find().sort({ _id: -1 });
      response.salts = await Salt.find().sort({ _id: -1 });
    }

    return NextResponse.json(
      {
        response,
        userRole,
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
  let manufacturer = req.nextUrl.searchParams.get("manufacturer");
  let vendor = req.nextUrl.searchParams.get("vendor");
  let mr = req.nextUrl.searchParams.get("mr");
  let salts = req.nextUrl.searchParams.get("salts");
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
  const { name, contact, useCase, comment } = await req.json();

  try {
    let response;
    if (manufacturer == "1") {
      response = new Manufacturer({name});
    }
    else if (vendor == "1") {
      response = new Vendor({name, contact});
    }
    else if (mr == "1") {
      response = new MedicalRepresentator({name, contact});
    }
    else if (salts == "1") {
      response = new Salt({name, useCase, comment});
    }
    if (response) await response.save();
    return NextResponse.json(
      { response, success: true },
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
