import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/Mongodb";
import { verifyTokenWithLogout } from "@/app/utils/jwt";
import { Stock, HospitalStock } from "@/app/models/Stock";

export async function GET(req) {
  await dbConnect();
  let expired = req.nextUrl.searchParams.get("expired");
  let days = req.nextUrl.searchParams.get("days");
  let month = req.nextUrl.searchParams.get("month");
  let year = req.nextUrl.searchParams.get("year");
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

  try {
    const today = new Date();
    let startDate = null;
    let endDate = null;

    // Expired case
    if (expired === "1") {
      endDate = today; // purane stocks jo expire ho gaye
    } else {
      // Non-expired ranges
      if (days === "15") {
        startDate = today;
        endDate = new Date(today);
        endDate.setDate(today.getDate() + 15);
      } else if (month === "1") {
        startDate = new Date(today);
        startDate.setDate(today.getDate() + 15); // after 15 days
        endDate = new Date(today);
        endDate.setMonth(today.getMonth() + 1);
      } else if (month === "3") {
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() + 1);
        endDate = new Date(today);
        endDate.setMonth(today.getMonth() + 3);
      } else if (month === "6") {
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() + 3);
        endDate = new Date(today);
        endDate.setMonth(today.getMonth() + 6);
      } else if (year === "1") {
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() + 6);
        endDate = new Date(today);
        endDate.setFullYear(today.getFullYear() + 1);
      }
    }

    let dateFilter = {};
    if (expired === "1") {
      dateFilter = { $lt: endDate }; // sirf expire ho chuke
    } else {
      dateFilter = { $gte: startDate, $lte: endDate }; // beech wale
    }

    let Model = sectionType === "hospital" ? HospitalStock : Stock;

    const expiringStocks = await Model.aggregate([
      {
        $match: {
          expiryDate: dateFilter,
          "quantity.totalStrips": { $gt: 0 }, // Ensure available stock
        },
      },
      {
        $lookup: {
          from: "medicines",
          localField: "medicine",
          foreignField: "_id",
          as: "medicine",
        },
      },
      { $unwind: "$medicine" },
      {
        $lookup: {
          from: "manufacturers",
          localField: "medicine.manufacturer",
          foreignField: "_id",
          as: "medicine.manufacturer",
        },
      },
      {
        $unwind: {
          path: "$medicine.manufacturer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "salts",
          localField: "medicine.salts",
          foreignField: "_id",
          as: "medicine.salts",
        },
      },
      {
        $group: {
          _id: "$medicine._id",
          medicine: { $first: "$medicine" }, // Keep only one medicine data
          stocks: { $push: "$$ROOT" }, // Collect all stocks for this medicine
        },
      },
      {
        $addFields: {
          stocks: {
            $sortArray: { input: "$stocks", sortBy: { expiryDate: 1 } },
          },
          earliestExpiry: { $min: "$stocks.expiryDate" }, // Earliest batch for medicine
        },
      },
      // Sort medicines by earliestExpiry
      {
        $sort: { earliestExpiry: 1 },
      },
      {
        $project: {
          _id: 1,
          "medicine.name": 1,
          "medicine.manufacturer": 1, // Full Manufacturer object
          "medicine.salts": 1, // Full Salts array
          stocks: 1,
        },
      },
    ]);

    return NextResponse.json(
      { message: "Successfully fetched", success: true, expiringStocks },
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
