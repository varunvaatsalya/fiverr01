import { NextResponse } from "next/server";
import dbConnect from "../../../lib/Mongodb";
import { verifyTokenWithLogout } from "../../../utils/jwt";
import PurchaseInvoice from "../../../models/PurchaseInvoice";
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

  const { startDate, endDate, vendorId, saltId, manufacturerId } =
    await req.json();

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
      invoiceDate: { $gte: start, $lte: end },
    };
    if (vendorId) matchStage.vendor = new mongoose.Types.ObjectId(vendorId);
    if (manufacturerId)
      matchStage.manufacturer = new mongoose.Types.ObjectId(manufacturerId);

    const pipeline = [
      { $match: matchStage },
      { $unwind: "$stocks" },

      // Lookup stocks
      {
        $lookup: {
          from: "stocks",
          localField: "stocks.stockId",
          foreignField: "_id",
          as: "stock",
        },
      },
      { $unwind: "$stock" },

      // Lookup medicines
      {
        $lookup: {
          from: "medicines",
          localField: "stock.medicine",
          foreignField: "_id",
          as: "medicine",
        },
      },
      { $unwind: "$medicine" },

      // Agar saltId diya hai, to salt match karo
      ...(saltId
        ? [
            {
              $match: {
                "medicine.salts": new mongoose.Types.ObjectId(saltId),
              },
            },
          ]
        : []),

      // Lookup salt
      {
        $lookup: {
          from: "salts",
          localField: "medicine.salts",
          foreignField: "_id",
          as: "salt",
        },
      },
      { $unwind: "$salt" },

      // Lookup manufacturer
      {
        $lookup: {
          from: "manufacturers",
          localField: "medicine.manufacturer",
          foreignField: "_id",
          as: "manufacturer",
        },
      },
      { $unwind: "$manufacturer" },

      // Final Grouping
      {
        $group: {
          _id: "$medicine._id",
          name: { $first: "$medicine.name" },
          manufacturer: { $first: "$salt.name" },
          salts: { $first: "$manufacturer.name" },
          totalPurchasedStrips: { $sum: "$stock.quantity.totalStrips" },
          totalAmount: {
            $sum: {
              $multiply: [
                "$stock.quantity.totalStrips",
                "$stock.purchasePrice",
              ],
            },
          },
        },
      },

      { $sort: { medicineName: 1 } },
    ];

    const reports = await PurchaseInvoice.aggregate(pipeline);

    console.log("Reports: ", reports);
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
