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
          isDelivered: { $ne: null },
          paymentMode: { $ne: "Credit-Others" },
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

      {
        $group: {
          _id: "$medicines.medicineId",
          medId: { $first: "$medicineDetails._id" },
          name: { $first: "$medicineDetails.name" },
          manufacturer: { $first: "$manufacturerDetails.name" },
          salts: { $first: "$saltDetails.name" },
          totalStripsSold: {
            $sum: "$medicines.allocatedStock.quantity.strips",
          },
          totalRevenue: {
            $sum: {
              $multiply: [
                "$medicines.allocatedStock.sellingPrice",
                "$medicines.allocatedStock.quantity.strips",
              ],
            },
          },
        },
      },

      // Returns adjustment
      {
        $lookup: {
          from: "pharmacyinvoices",
          let: { medicineId: "$_id" },
          pipeline: [
            { $unwind: "$returns" },
            { $unwind: "$returns.medicines" },
            {
              $match: {
                $expr: {
                  $eq: ["$returns.medicines.medicineId", "$$medicineId"],
                },
              },
            },
            { $unwind: "$returns.medicines.returnStock" },
            {
              $group: {
                _id: null,
                totalReturnRevenue: {
                  $sum: {
                    $multiply: [
                      "$returns.medicines.returnStock.sellingPrice",
                      "$returns.medicines.returnStock.quantity.strips",
                    ],
                  },
                },
                totalReturnStrips: {
                  $sum: "$returns.medicines.returnStock.quantity.strips",
                },
              },
            },
          ],
          as: "returnsInfo",
        },
      },

      {
        $addFields: {
          totalReturnRevenue: {
            $ifNull: [
              { $arrayElemAt: ["$returnsInfo.totalReturnRevenue", 0] },
              0,
            ],
          },
          totalReturnStrips: {
            $ifNull: [
              { $arrayElemAt: ["$returnsInfo.totalReturnStrips", 0] },
              0,
            ],
          },
        },
      },

      {
        $addFields: {
          netRevenue: { $subtract: ["$totalRevenue", "$totalReturnRevenue"] },
          netStripsSold: {
            $subtract: ["$totalStripsSold", "$totalReturnStrips"],
          },
        },
      },

      {
        $project: {
          _id: 1,
          medId: 1,
          name: 1,
          manufacturer: 1,
          salts: 1,
          netRevenue: 1,
          netStripsSold: 1,
        },
      },
    ];

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
