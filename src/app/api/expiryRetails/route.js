import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyToken } from "../../utils/jwt";
import RetailStock from "../../models/RetailStock";

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

  const decoded = await verifyToken(token.value);
  const userRole = decoded?.role;
  if (!decoded || !userRole) {
    return NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
  }

  try {
    const today = new Date();
    let targetDate = new Date();
    if (days === "15") targetDate.setDate(today.getDate() + 15);
    else if (month === "1" || month === "3" || month === "6")
      targetDate.setMonth(today.getMonth() + parseInt(month));
    else if (year === "1") targetDate.setFullYear(today.getFullYear() + 1);

    const matchStage =
      expired === "1"
        ? { "stocks.expiryDate": { $lt: today } }
        : { "stocks.expiryDate": { $gte: today, $lte: targetDate } };

    const expiringStocks = await RetailStock.aggregate([
        {
          $match: matchStage, // Match documents having at least one stock in this range
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
                          { $gte: ["$$stock.expiryDate", today] },
                          { $lte: ["$$stock.expiryDate", targetDate] },
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
            "_id": 1,
            "medicine._id": 1,
            "medicine.name": 1,
            "medicine.manufacturer": 1, // Full manufacturer object
            "medicine.salts": 1, // Full salts array
            "stocks": 1,
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
