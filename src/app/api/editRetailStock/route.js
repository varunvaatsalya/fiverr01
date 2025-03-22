import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyToken } from "../../utils/jwt";
import RetailStock from "../../models/RetailStock";

export async function GET(req) {
  await dbConnect();
  const id = req.nextUrl.searchParams.get("id");
  if (!id)
    return NextResponse.json(
      { message: "Invalid Params", success: false },
      { status: 401 }
    );
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

  try {
    let retailStocks = await RetailStock.findOne({ medicine: id }).populate({
      path: "medicine",
      select: "name",
    });
    return NextResponse.json(
      { stocks: retailStocks || {}, success: true },
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
  if (userRole !== "admin") {
    return NextResponse.json(
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }

  const { details } = await req.json();

  try {
    let retailStocks = await RetailStock.findById(details._id);
    if (!retailStocks) {
      return NextResponse.json(
        { message: "Stock is not available for uodate", success: false },
        { status: 200 }
      );
    }

    details.stocks.forEach((stock) => {
      stock.quantity.totalStrips =
        stock.quantity.boxes * stock.packetSize.strips + stock.quantity.extra;
    });
    retailStocks.stocks = details.stocks;
    await retailStocks.save();
    return NextResponse.json({ message:"Updated Successfully!",success: true }, { status: 200 });
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
