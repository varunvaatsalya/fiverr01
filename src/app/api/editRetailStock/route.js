import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyToken } from "../../utils/jwt";
import RetailStock from "../../models/RetailStock";

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

  const decoded = await verifyToken(token.value);
  const userRole = decoded.role;
  const userEditPermission = decoded.editPermission;
  console.log(userRole, userEditPermission);
  if (!decoded || !userRole) {
    return NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
  }
  if (
    (userRole !== "admin" && userRole !== "stockist") ||
    !userEditPermission
  ) {
    return NextResponse.json(
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }

  try {
    let retailStocks = await RetailStock.find().populate({
      path: "medicine",
      select: "name",
    });
    return NextResponse.json(
      { stocks: retailStocks, success: true },
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
  if (userRole !== "admin" && userRole !== "stockist") {
    return NextResponse.json(
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }

  const { data } = await req.json();

  try {
    for (const medicineStock of data) {
      medicineStock.stocks.forEach((stock) => {
        stock.quantity.totalStrips =
          stock.quantity.boxes * stock.packetSize.strips + stock.quantity.extra;
      });

      await RetailStock.findOneAndUpdate(
        { medicine: medicineStock.medicine },
        { stocks: medicineStock.stocks },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json(
      { message: "Updated Successfully!", success: true },
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
