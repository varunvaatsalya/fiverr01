import { NextResponse } from "next/server";
import dbConnect from "../../../lib/Mongodb";
import { verifyTokenWithLogout } from "../../../utils/jwt";
import Medicine from "../../../models/Medicine";

export async function GET(req) {
  await dbConnect();
  let letter = req.nextUrl.searchParams.get("letter");
  let approved = req.nextUrl.searchParams.get("approved");
  let sectionType = req.nextUrl.searchParams.get("sectionType");

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

  const retailstockCollection =
    sectionType === "hospital" ? "hospitalretailstocks" : "retailstocks";
  const requestCollection =
    sectionType === "hospital" ? "hospitalrequests" : "requests";

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
          from: requestCollection,
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
          from: retailstockCollection,
          localField: "_id",
          foreignField: "medicine",
          as: "retailStock",
        },
      },

      {
        $addFields: {
          filteredRequests: {
            $filter: {
              input: "$requests",
              as: "request",
              cond: onlyApproved
                ? { $eq: ["$$request.status", "Approved"] }
                : {
                    $or: [
                      { $eq: ["$$request.status", "Pending"] },
                      { $eq: ["$$request.status", "Approved"] },
                    ],
                  },
            },
          },
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
        $addFields: {
          minimumStockCount:
            sectionType === "hospital"
              ? "$minimumHospitalStockCount"
              : "$minimumStockCount",
          maximumStockCount:
            sectionType === "hospital"
              ? "$maximumHospitalStockCount"
              : "$maximumStockCount",
        },
      },
      {
        $addFields: {
          "minimumStockCount.retails": {
            $cond: [
              {
                $and: [
                  { $gt: ["$minimumStockCount.retails", 0] },
                  { $gt: ["$packetSize.strips", 0] },
                ],
              },
              {
                $round: {
                  $divide: ["$minimumStockCount.retails", "$packetSize.strips"],
                },
              },
              0,
            ],
          },
          "maximumStockCount.retails": {
            $cond: [
              {
                $and: [
                  { $gt: ["$maximumStockCount.retails", 0] },
                  { $gt: ["$packetSize.strips", 0] },
                ],
              },
              {
                $round: {
                  $divide: ["$maximumStockCount.retails", "$packetSize.strips"],
                },
              },
              0,
            ],
          },
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
          maximumStockCount: { $first: "$maximumStockCount" },
          requests: {
            $first: {
              $filter: {
                input: "$requests",
                as: "request",
                cond: onlyApproved
                  ? { $eq: ["$$request.status", "Approved"] }
                  : {
                      $or: [
                        { $eq: ["$$request.status", "Pending"] },
                        { $eq: ["$$request.status", "Approved"] },
                      ],
                    },
              },
            },
          },
          totalRetailStrips: {
            $sum: "$retailStock.stocks.quantity.totalStrips",
          },
        },
      },
      {
        $addFields: {
          totalRetailStock: {
            $cond: [
              {
                $and: [
                  { $isNumber: "$packetSize.strips" },
                  { $gt: ["$packetSize.strips", 0] },
                ],
              },
              {
                $round: {
                  $divide: ["$totalRetailStrips", "$packetSize.strips"],
                },
              },
              0,
            ],
          },
        },
      },
      {
        $addFields: {
          requestedQuantity: {
            $subtract: ["$maximumStockCount.retails", "$totalRetailStock"],
          },
        },
      },
      {
        $match: {
          $and: [
            {
              $or: [
                { "minimumStockCount.retails": { $eq: 0 } },
                {
                  $expr: {
                    $lte: ["$totalRetailStock", "$minimumStockCount.retails"],
                  },
                },
              ],
            },
            {
              requestedQuantity: { $gt: 0 },
            },
            {
              $expr: {
                $not: {
                  $and: [
                    { $eq: ["$maximumStockCount.retails", 0] },
                    { $eq: ["$minimumStockCount.retails", 0] },
                    { $eq: ["$totalRetailStock", 0] },
                  ],
                },
              },
            },
            ...(onlyApproved
              ? [
                  {
                    "requests.0.status": "Approved",
                  },
                ]
              : []),
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
          maximumStockCount: 1,
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
