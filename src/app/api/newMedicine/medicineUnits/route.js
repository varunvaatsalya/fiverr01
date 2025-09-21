import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/Mongodb";
import { verifyTokenWithLogout } from "@/app/utils/jwt";
import UnitOption from "@/app/models/UnitOption";

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

  try {
    let units = await UnitOption.findOne();
    if (!units) {
      units = await UnitOption.create({
        level0: [],
        level1: [],
        level2: [],
      });
    }

    return NextResponse.json({ success: true, units });
  } catch (err) {
    console.error("GET error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch units" },
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

  if (userRole !== "admin" && userRole !== "owner") {
    return NextResponse.json(
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();

    const { level0 = [], level1 = [], level2 = [] } = body;

    let units = await UnitOption.findOne();
    if (!units) {
      units = await UnitOption.create({ level0, level1, level2 });
    } else {
      units.level0 = level0;
      units.level1 = level1;
      units.level2 = level2;
      units.updatedAt = new Date();
      await units.save();
    }

    return NextResponse.json({
      success: true,
      message: "Units saved successfully",
      units,
    });
  } catch (err) {
    console.error("POST error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to save units" },
      { status: 500 }
    );
  }
}
