import { NextResponse } from "next/server";
import dbConnect from "../../../lib/Mongodb";
import { verifyTokenWithLogout } from "../../../utils/jwt";
import Medicine from "../../../models/Medicine";

export async function GET(req) {
  await dbConnect();
  let letter = req.nextUrl.searchParams.get("letter");
  let approved = req.nextUrl.searchParams.get("approved");

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
      return NextResponse.json(
        { message: "Invalid token.", success: false },
        { status: 403 }
      );
    }

    let onlyApproved = approved === "1" ? true : false;
  try {
    const retailOutOfStockData = await Medicine.aggregate([
      {
        $match: {
          name: {
            $regex: `^[^a-zA-Z]*[${letter || "A"}]`,
            $options: "i",
          },
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
        $lookup: {
          from: "retailstocks",
          localField: "_id",
          foreignField: "medicine",
          as: "retailStock",
        },
      },
      {
        $unwind: {
          path: "$retailStock",
          preserveNullAndEmptyArrays: true, // Avoid losing medicines with no stock
        },
      },
      {
        $unwind: {
          path: "$retailStock.stocks",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          manufacturer: { $first: { $arrayElemAt: ["$manufacturer", 0] } },
          salts: { $first: "$salts" },
          isTablets: { $first: "$isTablets" },
          packetSize: { $first: "$packetSize" },
          minimumStockCount: { $first: "$minimumStockCount" },
          requests: {
            $first: {
              $filter: {
                input: "$requests",
                as: "request",
                cond: {
                  $cond: {
                    if: { $eq: [onlyApproved, true] }, // `onlyApproved` ko boolean bana ke bhejna
                    then: { $eq: ["$$request.status", "Approved"] },
                    else: {
                      $or: [
                        { $eq: ["$$request.status", "Pending"] },
                        { $eq: ["$$request.status", "Approved"] }
                      ]
                    }
                  }
                }
                
              },
            },
          },
          totalRetailStock: { $sum: "$retailStock.stocks.quantity.boxes" },
        },
      },
      {
        $match: {
          $or: [
            { minimumStockCount: null }, // Medicines with no minimum stock count
            {
              "minimumStockCount.retails": { $exists: true },
              $expr: {
                $lt: ["$totalRetailStock", "$minimumStockCount.retails"],
              },
            },
          ],
        },
      },
      {
        $project: {
          name: 1,
          manufacturer: 1,
          salts: 1,
          packetSize: 1,
          isTablets: 1,
          minimumStockCount: 1,
          totalRetailStock: 1,
          requests: {
            _id: 1,
            enteredRemainingQuantity: 1,
            status: 1,
            createdAt: 1,
            allocatedStocks: 1,
          },
        },
      },
      {
        $sort: { name: 1 },
      },
    ]);

    return NextResponse.json(
      {
        medicines: retailOutOfStockData,
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
