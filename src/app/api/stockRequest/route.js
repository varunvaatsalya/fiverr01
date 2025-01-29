import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyToken } from "../../utils/jwt";
import Medicine from "../../models/Medicine";
import Stock from "../../models/Stock";
import Request from "../../models/Request";

export async function GET(req) {
  await dbConnect();
  let id = req.nextUrl.searchParams.get("id");

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
    if (id) {
      // Step 1: Fetch the request details
      const request = await Request.findById(id).populate({
        path: "medicine",
        populate: { path: "salts", select: "name" },
      });
      if (!request) {
        return NextResponse.json(
          {
            message: "Request not found",
            success: false,
          },
          { status: 404 }
        );
      }

      const { requestedQuantity, medicine } = request;

      // Fetch the total quantity requested (converted into strips)
      const packetSize = medicine.packetSize.strips;
      const totalRequestedStrips = requestedQuantity * packetSize;

      // Step 2: Fetch all stocks for the given medicine, sorted by oldest first (FIFO)
      const stocks = await Stock.find({ medicine: medicine._id })
        .sort({ createdAt: 1 })
        .select("quantity remainingStrips batchName expiryDate createdAt");

      if (!stocks || stocks.length === 0) {
        return NextResponse.json(
          {
            message: "No stock available for this medicine",
            success: false,
          },
          { status: 404 }
        );
      }

      let remainingStrips = totalRequestedStrips;
      const allocatedStocks = [];

      // Step 3: Allocate the quantity from stocks using FIFO logic
      for (const stock of stocks) {
        if (remainingStrips <= 0) break;

        const availableStrips = stock.quantity.totalStrips;
        const allocatedStrips = Math.min(availableStrips, remainingStrips);

        allocatedStocks.push({
          stockId: stock._id,
          batchName: stock.batchName,
          expiryDate: stock.expiryDate,
          createdAt: stock.createdAt,
          allocatedQuantity: {
            totalStrips: allocatedStrips,
            boxes: Math.floor(allocatedStrips / packetSize),
            extraStrips: allocatedStrips % packetSize,
          },
        });

        remainingStrips -= allocatedStrips;
      }

      if (remainingStrips > 0) {
        return NextResponse.json(
          {
            message: "Insufficient stock to fulfill this request",
            success: false,
          },
          { status: 400 }
        );
      }
      console.log("before return");

      // Step 4: Respond with the allocation details
      return NextResponse.json(
        {
          allocatedStocks,
          request,
          message: "Allocation details fetched successfully",
          success: true,
        },
        { status: 200 }
      );
    }

    let requests = await Request.find({ status: "Pending" }).populate({
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

    let newMedicineStockRequest = new Request({
      medicine,
      requestedQuantity,
      notes,
    });
    await newMedicineStockRequest.save();
    return NextResponse.json(
      { newMedicineStockRequest, message: "Request Created Successfully!", success: true },
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
  let id = req.nextUrl.searchParams.get("id");

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
  
  try {
    if (id) {
      let request = await Request.findByIdAndUpdate(
        id,
        { status: "Rejected" },
        { new: true } // Return the updated document
      );
  
      if (!request) {
        return NextResponse.json(
          {
            message: "Request not found",
            success: false,
          },
          { status: 404 }
        );
      } else {
        return NextResponse.json(
          {
            message: "Request status updated to Rejected successfully",
            success: true,
            request,
          },
          { status: 200 }
        );
      }
    } else {
      return NextResponse.json(
        {
          message: "Request ID is missing",
          success: false,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error updating request status:", error);
    return NextResponse.json(
      {
        message: "Internal server error.",
        success: false,
      },
      { status: 500 }
    );
  }
  
}
