import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyToken } from "../../utils/jwt";
import Medicine from "../../models/Medicine";

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
  if (!decoded || !userRole) {
    return NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
  }

  try {
    const retailStockData = await Medicine.aggregate([
      {
        $lookup: {
          from: "retailstocks", // Changed to retailstocks collection
          localField: "_id",
          foreignField: "medicine",
          as: "retailStocks", // Alias for retail stocks
        },
      },
      {
        $lookup: {
          from: "requests",
          localField: "_id",
          foreignField: "medicine",
          as: "requests",
        },
      },
      {
        $lookup: {
          from: "manufacturers",
          localField: "manufacturer",
          foreignField: "_id",
          as: "manufacturer",
        },
      },
      {
        $lookup: {
          from: "salts",
          localField: "salts",
          foreignField: "_id",
          as: "salts",
        },
      },
      {
        $addFields: {
          requests: {
            $filter: {
              input: "$requests",
              as: "request",
              cond: { $or: [{ $eq: ["$$request.status", "Pending"] }, { $eq: ["$$request.status", "Approved"] }] },
            },
          },
        },
      },
      {
        $project: {
          name: 1,
          manufacturer: { $arrayElemAt: ["$manufacturer", 0] },
          salts: 1,
          packetSize: 1,
          minimumStockCount: 1,
          retailStocks: {
            _id: 1,
            stocks: 1,
            createdAt: 1,
            updatedAt: 1,
          },
          requests: {
            _id: 1,
            requestedQuantity: 1,
            status: 1,
            createdAt: 1,
            allocatedStocks: 1,
          },
        },
      },
      {
        $sort: {
          name: 1,
        },
      },
    ]);

    return NextResponse.json(
      {
        medicines: retailStockData,
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
