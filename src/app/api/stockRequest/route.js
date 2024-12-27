import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyToken } from "../../utils/jwt";
import Medicine from "../../models/Medicine";
import Stock from "../../models/Stock";
import Request from "../../models/Request";

export async function GET(req) {
  await dbConnect();
  let id = req.nextUrl.searchParams.get("id");

  // const token = req.cookies.get("authToken");
  // if (!token) {
  //   console.log("Token not found. Redirecting to login.");
  //   return NextResponse.json(
  //     { message: "Access denied. No token provided.", success: false },
  //     { status: 401 }
  //   );
  // }

  // const decoded = await verifyToken(token.value);
  // const userRole = decoded.role;
  // if (!decoded || !userRole) {
  //   return NextResponse.json(
  //     { message: "Invalid token.", success: false },
  //     { status: 403 }
  //   );
  // }

  try {
    let requests = await Request.find({}).sort({ _id: -1 }).populate({
      path: "medicine",
      select: "name _id",
    });

    return NextResponse.json(
      {
        requests,
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

  // const token = req.cookies.get("authToken");
  // if (!token) {
  //   console.log("Token not found. Redirecting to login.");
  //   return NextResponse.json(
  //     { message: "Access denied. No token provided.", success: false },
  //     { status: 401 }
  //   );
  // }

  // const decoded = await verifyToken(token.value);
  // const userRole = decoded.role;
  // if (!decoded || !userRole) {
  //   return NextResponse.json(
  //     { message: "Invalid token.", success: false },
  //     { status: 403 }
  //   );
  // }
  // if (userRole !== "admin" && userRole !== "retailer") {
  //   return NextResponse.json(
  //     { message: "Access denied. admins only.", success: false },
  //     { status: 403 }
  //   );
  // }

  const { medicine, requestedQuantity, notes } = await req.json();

  try {
    if (!medicine || !requestedQuantity) {
      return NextResponse.json(
        { message: "Medicine ID and quantity are required", success: false },
        { status: 400 }
      );
    }

    let medicineData = await Medicine.findById(medicine);
    if (!medicineData) {
      return NextResponse.json(
        { message: "Medicine not found", success: false },
        { status: 404 }
      );
    }

    // Step 1: Fetch all stocks associated with the given medicine
    const stocks = await Stock.find({ medicine });

    if (!stocks || stocks.length === 0) {
      return NextResponse.json(
        { message: "No stock found for this medicine", success: false },
        { status: 404 }
      );
    }

    // Step 2: Calculate total stock available for the medicine
    const totalAvailableStrips = stocks.reduce((total, stock) => {
      return total + stock.quantity.totalStrips;
    }, 0);

    if (totalAvailableStrips === 0) {
      return NextResponse.json(
        { message: "No stock available for this medicine", success: false },
        { status: 404 }
      );
    }

    let newMedicineStock = new Request({
      medicine,
      requestedQuantity,
      notes,
    });
    await newMedicineStock.save();
    return NextResponse.json(
      { newMedicineStock, message: "Stock Added Successfully!", success: true },
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
