import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/Mongodb";
import { verifyTokenWithLogout } from "@/app/utils/jwt";
import Medicine from "@/app/models/Medicine";

export async function GET(req) {
  await dbConnect();
  let days = req.nextUrl.searchParams.get("days");
  let riskZone = req.nextUrl.searchParams.get("riskZone");
  let op = req.nextUrl.searchParams.get("op");

  //   const token = req.cookies.get("authToken");
  //   if (!token) {
  //     console.log("Token not found. Redirecting to login.");
  //     return NextResponse.json(
  //       { message: "Access denied. No token provided.", success: false },
  //       { status: 401 }
  //     );
  //   }

  //   const decoded = await verifyTokenWithLogout(token.value);
  //   const userRole = decoded?.role;
  //   if (!decoded || !userRole) {
  //     let res = NextResponse.json(
  //       { message: "Invalid token.", success: false },
  //       { status: 403 }
  //     );
  //     res.cookies.delete("authToken");
  //     return res;
  //   }

  days = Number(days ?? 30);
  const riskZoneParam =
    typeof riskZone === "string"
      ? riskZone.toLowerCase() === "true"
        ? true
        : riskZone.toLowerCase() === "false"
        ? false
        : null
      : null; // null = not filtering by risk
  op = (op || "and").toLowerCase() === "or" ? "or" : "and";

  const now = new Date();
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  try {
    const pipeline = [
      // basic medicine fields
      {
        $project: {
          name: 1,
          manufacturer: 1,
          salts: 1,
          isTablets: 1,
          medicineType: 1,
          packetSize: 1,
          minimumStockCount: 1,
          createdAt: 1,
        },
      },

      // populate manufacturer name
      {
        $lookup: {
          from: "manufacturers",
          localField: "manufacturer",
          foreignField: "_id",
          as: "manufacturer",
          pipeline: [{ $project: { _id: 1, name: 1 } }],
        },
      },
      { $set: { manufacturer: { $first: "$manufacturer" } } },

      // populate salt name (assuming 1 salt; if array, switch to pipeline+map)
      {
        $lookup: {
          from: "salts",
          localField: "salts",
          foreignField: "_id",
          as: "salts",
          pipeline: [{ $project: { _id: 1, name: 1 } }],
        },
      },
      { $set: { salts: { $first: "$salts" } } },

      // GODOWN batches grouped: by batchName + expiryDate
      {
        $lookup: {
          from: "stocks",
          let: { medId: "$_id" },
          as: "godownBatches",
          pipeline: [
            { $match: { $expr: { $eq: ["$medicine", "$$medId"] } } },
            {
              $group: {
                _id: { batchName: "$batchName", expiryDate: "$expiryDate" },
                godownTotalStrips: { $sum: "$quantity.totalStrips" },
                packetSize: { $last: "$packetSize" }, // take any representative
              },
            },
            {
              $project: {
                _id: 0,
                batchName: "$_id.batchName",
                expiryDate: "$_id.expiryDate",
                godownTotalStrips: 1,
                packetSize: 1,
              },
            },
          ],
        },
      },

      // RETAIL batches grouped
      {
        $lookup: {
          from: "retailstocks",
          let: { medId: "$_id" },
          as: "retailBatches",
          pipeline: [
            { $match: { $expr: { $eq: ["$medicine", "$$medId"] } } },
            { $unwind: "$stocks" },
            {
              $group: {
                _id: {
                  batchName: "$stocks.batchName",
                  expiryDate: "$stocks.expiryDate",
                },
                retailTotalStrips: { $sum: "$stocks.quantity.totalStrips" },
                packetSize: { $last: "$stocks.packetSize" },
              },
            },
            {
              $project: {
                _id: 0,
                batchName: "$_id.batchName",
                expiryDate: "$_id.expiryDate",
                retailTotalStrips: 1,
                packetSize: 1,
              },
            },
          ],
        },
      },

      // merge both sources → combined batches
      {
        $set: {
          mergedBatches: {
            $concatArrays: ["$godownBatches", "$retailBatches"],
          },
        },
      },
      { $unwind: { path: "$mergedBatches", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            medId: "$_id",
            batchName: "$mergedBatches.batchName",
            expiryDate: "$mergedBatches.expiryDate",
          },
          name: { $first: "$name" },
          manufacturer: { $first: "$manufacturer" },
          salts: { $first: "$salts" },
          minimumStockCount: { $first: "$minimumStockCount" },
          packetSize: { $last: "$mergedBatches.packetSize" },
          godownTotalStrips: {
            $sum: {
              $cond: [
                { $in: ["$mergedBatches", "$godownBatches"] }, // not reliable; recompute below
                "$mergedBatches.godownTotalStrips",
                0,
              ],
            },
          },
          retailTotalStrips: {
            $sum: {
              $cond: [
                { $in: ["$mergedBatches", "$retailBatches"] },
                "$mergedBatches.retailTotalStrips",
                0,
              ],
            },
          },
          // work-around: we’ll correctly sum in next regroup
          batchesRaw: { $push: "$mergedBatches" },
        },
      },

      // Proper regroup to sum retail/godown totals by batch
      {
        $project: {
          name: 1,
          manufacturer: 1,
          salts: 1,
          minimumStockCount: 1,
          packetSize: 1,
          batchName: "$_id.batchName",
          expiryDate: "$_id.expiryDate",
          medId: "$_id.medId",
          parts: "$batchesRaw",
        },
      },
      { $unwind: { path: "$parts", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            medId: "$medId",
            batchName: "$batchName",
            expiryDate: "$expiryDate",
          },
          name: { $first: "$name" },
          manufacturer: { $first: "$manufacturer" },
          salts: { $first: "$salts" },
          minimumStockCount: { $first: "$minimumStockCount" },
          packetSize: { $first: "$packetSize" },
          retailTotalStrips: {
            $sum: { $ifNull: ["$parts.retailTotalStrips", 0] },
          },
          godownTotalStrips: {
            $sum: { $ifNull: ["$parts.godownTotalStrips", 0] },
          },
        },
      },
      {
        $set: {
          totalStrips: { $add: ["$retailTotalStrips", "$godownTotalStrips"] },
        },
      },

      // Risk zone calculation
      {
        $set: {
          daysLeft: {
            $dateDiff: {
              startDate: new Date(),
              endDate: "$_id.expiryDate",
              unit: "day",
            },
          },
          avg7: { $ifNull: ["$minimumStockCount.retails", 0] },
        },
      },
      {
        $set: {
          dailyRate: { $divide: ["$avg7", 7] },
          safeDaysLeft: { $max: ["$daysLeft", 0] },
        },
      },
      {
        $set: {
          projectedDemand: { $multiply: ["$dailyRate", "$safeDaysLeft"] },
          riskZone: { $gt: ["$totalStrips", "$projectedDemand"] },
        },
      },

      // Collect batches back into medicines
      {
        $group: {
          _id: "$_id.medId",
          name: { $first: "$name" },
          manufacturer: { $first: "$manufacturer" },
          salts: { $first: "$salts" },
          batches: {
            $push: {
              batchName: "$_id.batchName",
              expiryDate: "$_id.expiryDate",
              packetSize: "$packetSize",
              retailTotalStrips: "$retailTotalStrips",
              godownTotalStrips: "$godownTotalStrips",
              totalStrips: "$totalStrips",
              projectedDemand: "$projectedDemand",
              riskZone: "$riskZone",
            },
          },
        },
      },

      // lastSoldAt from PharmacyInvoice
      {
        $lookup: {
          from: "pharmacyinvoices",
          let: { medId: "$_id" },
          as: "lastSold",
          pipeline: [
            {
              $match: {
                $expr: {
                  $gt: [
                    {
                      $size: {
                        $filter: {
                          input: "$medicines",
                          as: "m",
                          cond: { $eq: ["$$m.medicineId", "$$medId"] },
                        },
                      },
                    },
                    0,
                  ],
                },
              },
            },
            // ensure quantity > 0 actually sold
            {
              $match: {
                $expr: {
                  $gt: [
                    {
                      $sum: {
                        $map: {
                          input: {
                            $filter: {
                              input: "$medicines",
                              as: "m",
                              cond: { $eq: ["$$m.medicineId", "$$medId"] },
                            },
                          },
                          as: "mm",
                          in: {
                            $sum: {
                              $map: {
                                input: "$$mm.allocatedStock",
                                as: "al",
                                in: {
                                  $add: [
                                    { $ifNull: ["$$al.quantity.strips", 0] },
                                    {
                                      // tablets are ignored (or convert if you must)
                                      $cond: [
                                        { $gt: ["$$al.quantity.tablets", 0] },
                                        0,
                                        0,
                                      ],
                                    },
                                  ],
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                    0,
                  ],
                },
              },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            { $project: { _id: 0, createdAt: 1 } },
          ],
        },
      },
      {
        $set: {
          lastSoldAt: { $ifNull: [{ $first: "$lastSold.createdAt" }, null] },
        },
      },

      // Apply riskZone filter (if provided): keep only matching batches
      ...(riskZoneParam !== null
        ? [
            {
              $set: {
                batches: {
                  $filter: {
                    input: "$batches",
                    as: "b",
                    cond: {
                      $eq: ["$$b.riskZone", riskZoneParam],
                    },
                  },
                },
              },
            },
            // optionally drop medicines with no batches after filter
            { $match: { $expr: { $gt: [{ $size: "$batches" }, 0] } } },
          ]
        : []),

      // lastSold condition
      {
        $set: {
          notSoldInDays: {
            $or: [
              { $eq: ["$lastSoldAt", null] },
              { $lt: ["$lastSoldAt", cutoff] },
            ],
          },
        },
      },

      // Now combine with op
      ...(op === "or"
        ? [
            {
              $match: {
                $expr:
                  riskZoneParam === null
                    ? { $eq: [true, "$notSoldInDays"] } // only lastSold if risk not asked
                    : {
                        $or: [
                          { $eq: [true, "$notSoldInDays"] },
                          { $gt: [{ $size: "$batches" }, 0] }, // has batches after risk filter
                        ],
                      },
              },
            },
          ]
        : [
            {
              $match: {
                $expr:
                  riskZoneParam === null
                    ? { $eq: [true, "$notSoldInDays"] } // only lastSold if risk not asked
                    : {
                        $and: [
                          { $eq: [true, "$notSoldInDays"] },
                          { $gt: [{ $size: "$batches" }, 0] },
                        ],
                      },
              },
            },
          ]),

      // Final shape
      {
        $project: {
          _id: 1,
          name: 1,
          "manufacturer._id": 1,
          "manufacturer.name": 1,
          "salts._id": 1,
          "salts.name": 1,
          lastSoldAt: 1,
          batches: 1,
        },
      },
      { $sort: { lastSoldAt: 1, name: 1 } }, // nulls first
    ];

    const result = await Medicine.aggregate(pipeline);

    return NextResponse.json(
      {
        params: { days, riskZone: riskZoneParam, op },
        count: result.length,
        data: result,
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
