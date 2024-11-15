import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyToken } from "../../utils/jwt";
import { Surgery, Package } from "../../models/Surgerys";

export async function GET(req) {
  await dbConnect();
  let type = req.nextUrl.searchParams.get("type");

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
  //   const userEditPermission = decoded.editPermission;
  if (!decoded || !userRole) {
    return NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
  }
  if (userRole !== "admin" && userRole !== "owner" && userRole !== "salesman") {
    return NextResponse.json(
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }

  try {
    if (type == "2") {
      let packages = await Package.find().sort({ _id: -1 });
      return NextResponse.json({ packages, success: true }, { status: 200 });
    }
    let surgery = await Surgery.find().sort({ _id: -1 });
    return NextResponse.json({ surgery, success: true }, { status: 200 });
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
  let type = req.nextUrl.searchParams.get("type");

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

  const { name, items, price } = await req.json();

  try {
    if (type == "1") {
      const existingSurgery = await Surgery.findOne({ name });
      if (existingSurgery) {
        return NextResponse.json(
          { message: "Ward already exists", success: false },
          { status: 200 }
        );
      }
      const newSurgery = new Surgery({
        name,
        price,
      });
      await newSurgery.save();

      return NextResponse.json(
        { surgery: newSurgery, success: true },
        { status: 201 }
      );
    }

    const existingPackage = await Package.findOne({ name });
    if (existingPackage) {
      return NextResponse.json(
        { message: "Package already exists", success: false },
        { status: 200 }
      );
    }
    const newPackage = new Package({
      name,
      items,
      price,
    });
    await newPackage.save();

    return NextResponse.json({ newPackage, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  await dbConnect();
  let type = req.nextUrl.searchParams.get("type");

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
      { message: "Access denied. Admins only.", success: false },
      { status: 403 }
    );
  }

  const { _id, name, items, price } = await req.json();

  try {
    if (type == "1") {
      const surgery = await Surgery.findByIdAndUpdate(_id, { name, price },{ new: true });
      return NextResponse.json({ surgery, success: true }, { status: 201 });
    }
    const updatedPackage = await Package.findByIdAndUpdate(_id, { name, items, price },{ new: true });
    return NextResponse.json({ Package:updatedPackage, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
