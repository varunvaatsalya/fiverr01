import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/Mongodb";
import { verifyTokenWithLogout } from "@/app/utils/jwt";
import RetailStock from "@/app/models/RetailStock";

export async function GET(req) {
  await dbConnect();
  let expired = req.nextUrl.searchParams.get("expired");
  let days = req.nextUrl.searchParams.get("days");
  let month = req.nextUrl.searchParams.get("month");
  let year = req.nextUrl.searchParams.get("year");

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

    const expiringStocks = await RetailStock.aggregate([
      {
        $match: { "stocks.expiryDate": dateFilter }, // Match documents having at least one stock in this range
      },
      {
        $addFields: {
          stocks: {
            $filter: {
              input: "$stocks",
              as: "stock",
              cond:
                expired === "1"
                  ? {
                      $and: [
                        { $lt: ["$$stock.expiryDate", today] }, // Expired stocks only
                        { $gt: ["$$stock.quantity.totalStrips", 0] }, // Only stocks where totalStrips > 0
                      ],
                    }
                  : {
                      $and: [
                        { $gte: ["$$stock.expiryDate", startDate] },
                        { $lte: ["$$stock.expiryDate", endDate] },
                        { $gt: ["$$stock.quantity.totalStrips", 0] }, // Only stocks where totalStrips > 0
                      ],
                    }, // Expiring stocks within range
            },
          },
        },
      },
      {
        $match: {
          "stocks.0": { $exists: true }, // Remove documents where stocks array becomes empty after filtering
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
      {
        $unwind: "$medicine",
      },
      {
        $lookup: {
          from: "manufacturers",
          localField: "medicine.manufacturer",
          foreignField: "_id",
          as: "medicine.manufacturer",
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
        $project: {
          _id: 1,
          "medicine._id": 1,
          "medicine.name": 1,
          "medicine.manufacturer": 1, // Full manufacturer object
          "medicine.salts": 1, // Full salts array
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
