import { NextResponse } from "next/server";
import dbConnect from "../../../lib/Mongodb";
import { verifyTokenWithLogout } from "../../../utils/jwt";
import PharmacyInvoice from "../../../models/PharmacyInvoice";
import mongoose from "mongoose";

function getDates() {
  const now = new Date();

  const endIST = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );

  const endUTC = new Date(endIST.getTime());
  return { endUTC };
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

  const { startDate, endDate, manufacturerId, saltId } = await req.json();

  let { endUTC } = getDates();
  const now = new Date();
  const firstDateIST = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);

  function getUTCDateTime(dateTime) {
    return new Date(dateTime);
  }

  let start = startDate ? getUTCDateTime(startDate) : firstDateIST;

  let end = endDate ? getUTCDateTime(endDate) : endUTC;

  try {
    const matchStage = {
      createdAt: {
        $gte: start,
        $lte: end,
      },
    };

    const pipeline = [
      {
        $match: {
          ...matchStage,
          // isDelivered: { $ne: null },
          // paymentMode: { $ne: "Credit-Others" },
        },
      },
      { $unwind: "$medicines" },
      { $unwind: "$medicines.allocatedStock" },
      {
        $lookup: {
          from: "medicines",
          localField: "medicines.medicineId",
          foreignField: "_id",
          as: "medicineDetails",
        },
      },
      { $unwind: "$medicineDetails" },
      {
        $lookup: {
          from: "manufacturers",
          localField: "medicineDetails.manufacturer",
          foreignField: "_id",
          as: "manufacturerDetails",
        },
      },
      {
        $unwind: {
          path: "$manufacturerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "salts",
          localField: "medicineDetails.salts",
          foreignField: "_id",
          as: "saltDetails",
        },
      },

      // Optional filtering
      ...(manufacturerId
        ? [
            {
              $match: {
                "medicineDetails.manufacturer": new mongoose.Types.ObjectId(
                  manufacturerId
                ),
              },
            },
          ]
        : []),
      ...(saltId
        ? [
            {
              $match: {
                "medicineDetails.salts": new mongoose.Types.ObjectId(saltId),
              },
            },
          ]
        : []),

      // Calculate equivalent strips & revenue
      {
        $addFields: {
          strips: "$medicines.allocatedStock.quantity.strips",
          tablets: "$medicines.allocatedStock.quantity.tablets",
          tabletsPerStrip:
            "$medicines.allocatedStock.packetSize.tabletsPerStrip",
          sellingPrice: "$medicines.allocatedStock.sellingPrice",
        },
      },
      {
        $addFields: {
          equivalentStrips: {
            $add: [
              { $ifNull: ["$strips", 0] },
              {
                $cond: [
                  { $gt: ["$tabletsPerStrip", 0] },
                  {
                    $divide: [{ $ifNull: ["$tablets", 0] }, "$tabletsPerStrip"],
                  },
                  0,
                ],
              },
            ],
          },
        },
      },
      {
        $addFields: {
          revenue: {
            $multiply: ["$equivalentStrips", "$sellingPrice"],
          },
        },
      },

      // Group by medicine
      // First group by medicine + paymentMode
      {
        $group: {
          _id: {
            medicineId: "$medicines.medicineId",
            paymentMode: "$paymentMode",
          },
          medId: { $first: "$medicineDetails._id" },
          name: { $first: "$medicineDetails.name" },
          manufacturer: { $first: "$manufacturerDetails.name" },
          salts: { $first: "$saltDetails.name" },
          stripsSold: { $sum: "$equivalentStrips" },
          revenue: { $sum: "$revenue" },
        },
      },

      // Then group by medicineId and accumulate paymentMode breakdown
      {
        $group: {
          _id: "$_id.medicineId",
          medId: { $first: "$medId" },
          name: { $first: "$name" },
          manufacturer: { $first: "$manufacturer" },
          salts: { $first: "$salts" },
          netStripsSold: { $sum: "$stripsSold" },
          netRevenue: { $sum: "$revenue" },
          paymentBreakdown: {
            $push: {
              paymentMode: "$_id.paymentMode",
              strips: "$stripsSold",
              revenue: "$revenue",
            },
          },
        },
      },

      // Final projection
      {
        $project: {
          _id: 1,
          medId: 1,
          name: 1,
          manufacturer: 1,
          salts: 1,
          netRevenue: 1,
          netStripsSold: 1,
          paymentBreakdown: 1,
        },
      },
    ];

    // const pipeline = [
    //   // 1. Match invoices within date range
    //   {
    //     $match: matchStage,
    //   },

    //   // 2. Unwind medicines and their allocated stock
    //   { $unwind: "$medicines" },
    //   { $unwind: "$medicines.allocatedStock" },

    //   // 3. Lookup medicine details
    //   {
    //     $lookup: {
    //       from: "medicines",
    //       localField: "medicines.medicineId",
    //       foreignField: "_id",
    //       as: "medicineDetails",
    //     },
    //   },
    //   { $unwind: "$medicineDetails" },

    //   // 4. Lookup manufacturer
    //   {
    //     $lookup: {
    //       from: "manufacturers",
    //       localField: "medicineDetails.manufacturer",
    //       foreignField: "_id",
    //       as: "manufacturerDetails",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$manufacturerDetails",
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },

    //   // 5. Lookup salts
    //   {
    //     $lookup: {
    //       from: "salts",
    //       localField: "medicineDetails.salts",
    //       foreignField: "_id",
    //       as: "saltDetails",
    //     },
    //   },

    //   // 6. Optional filters
    //   ...(manufacturerId
    //     ? [
    //         {
    //           $match: {
    //             "medicineDetails.manufacturer": new mongoose.Types.ObjectId(
    //               manufacturerId
    //             ),
    //           },
    //         },
    //       ]
    //     : []),
    //   ...(saltId
    //     ? [
    //         {
    //           $match: {
    //             "medicineDetails.salts": new mongoose.Types.ObjectId(saltId),
    //           },
    //         },
    //       ]
    //     : []),

    //   // 7. Flatten relevant fields
    //   {
    //     $addFields: {
    //       strips: "$medicines.allocatedStock.quantity.strips",
    //       tablets: "$medicines.allocatedStock.quantity.tablets",
    //       tabletsPerStrip:
    //         "$medicines.allocatedStock.packetSize.tabletsPerStrip",
    //       sellingPrice: "$medicines.allocatedStock.sellingPrice",
    //     },
    //   },

    //   // 8. Calculate equivalent strips
    //   {
    //     $addFields: {
    //       equivalentStrips: {
    //         $add: [
    //           { $ifNull: ["$strips", 0] },
    //           {
    //             $cond: [
    //               { $gt: ["$tabletsPerStrip", 0] },
    //               {
    //                 $divide: [{ $ifNull: ["$tablets", 0] }, "$tabletsPerStrip"],
    //               },
    //               0,
    //             ],
    //           },
    //         ],
    //       },
    //     },
    //   },

    //   // 9. Calculate revenue
    //   {
    //     $addFields: {
    //       revenue: {
    //         $multiply: ["$equivalentStrips", "$sellingPrice"],
    //       },
    //     },
    //   },

    //   // 10. Unwind payments for breakdown
    //   {
    //     $unwind: {
    //       path: "$payments",
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },

    //   // 11. Group by medicine + payment mode
    //   {
    //     $group: {
    //       _id: {
    //         medicineId: "$medicines.medicineId",
    //         paymentMode: "$payments.type",
    //       },
    //       medId: { $first: "$medicineDetails._id" },
    //       name: { $first: "$medicineDetails.name" },
    //       manufacturer: { $first: "$manufacturerDetails.name" },
    //       salts: { $first: "$saltDetails.name" },
    //       paymentAmount: { $sum: "$payments.amount" },

    //       // Only include non-"Credit-Others" in totals
    //       netStripsSold: {
    //         $sum: {
    //           $cond: [
    //             { $ne: ["$paymentMode", "Credit-Others"] },
    //             "$equivalentStrips",
    //             0,
    //           ],
    //         },
    //       },
    //       netRevenue: {
    //         $sum: {
    //           $cond: [
    //             { $ne: ["$paymentMode", "Credit-Others"] },
    //             "$revenue",
    //             0,
    //           ],
    //         },
    //       },
    //     },
    //   },

    //   // 12. Group again by medicine to build paymentModeBreakdown safely
    //   {
    //     $group: {
    //       _id: "$_id.medicineId",
    //       medId: { $first: "$medId" },
    //       name: { $first: "$name" },
    //       manufacturer: { $first: "$manufacturer" },
    //       salts: { $first: "$salts" },
    //       netStripsSold: { $sum: "$netStripsSold" },
    //       netRevenue: { $sum: "$netRevenue" },
    //       rawPayments: {
    //         $push: {
    //           mode: "$_id.paymentMode",
    //           amount: "$paymentAmount",
    //         },
    //       },
    //     },
    //   },

    //   // 13. Convert rawPayments to object with only valid k/v entries
    //   {
    //     $addFields: {
    //       paymentModeBreakdown: {
    //         $arrayToObject: {
    //           $map: {
    //             input: {
    //               $filter: {
    //                 input: "$rawPayments",
    //                 as: "pm",
    //                 cond: {
    //                   $and: [
    //                     { $ne: ["$$pm.mode", null] },
    //                     { $ne: ["$$pm.amount", null] },
    //                   ],
    //                 },
    //               },
    //             },
    //             as: "item",
    //             in: {
    //               k: "$$item.mode",
    //               v: "$$item.amount",
    //             },
    //           },
    //         },
    //       },
    //     },
    //   },

    //   // 14. Final projection
    //   {
    //     $project: {
    //       _id: 1,
    //       medId: 1,
    //       name: 1,
    //       manufacturer: 1,
    //       salts: 1,
    //       netStripsSold: 1,
    //       netRevenue: 1,
    //       paymentModeBreakdown: 1,
    //     },
    //   },
    // ];
    let reports = await PharmacyInvoice.aggregate(pipeline);

    return NextResponse.json(
      {
        success: true,
        reports,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
