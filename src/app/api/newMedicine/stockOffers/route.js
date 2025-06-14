import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/Mongodb";
import { verifyTokenWithLogout } from "@/app/utils/jwt";
import Medicine from "@/app/models/Medicine";

export async function GET(req) {
  await dbConnect();
  //   let basicInfo = req.nextUrl.searchParams.get("basicInfo");

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
    const medicines = await Medicine.find({
      offers: { $exists: true, $not: { $size: 0 } },
    }).select("name offers");

    return NextResponse.json(
      {
        medicines,
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

  const { medId, buyingQty, offerQty } = await req.json();

  try {
    await Medicine.findByIdAndUpdate(medId, {
      $push: {
        offers: {
          $each: [{ buyingQty, offerQty, createdAt: new Date() }],
          $position: 0,
        },
      },
    });
    const newOffer = await Medicine.findById(medId).select("name offers");

    return NextResponse.json(
      {
        newOffer,
        message: "Offer Saved Successfully!",
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
