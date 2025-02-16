import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyToken } from "../../utils/jwt";
import Stock from "../../models/Stock";

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

  try {const today = new Date();
    let targetDate = new Date();
    
    if (days === "15") {
      targetDate.setDate(today.getDate() + 15);
    } else if (month === "1" || month === "3" || month === "6") {
      targetDate.setMonth(today.getMonth() + parseInt(month));
    } else if (year === "1") {
      targetDate.setFullYear(today.getFullYear() + 1);
    }
    
    console.log("Today:", today, "Target Date:", targetDate); // Debugging output
    
    const expiringStocks = await Stock.aggregate([
      {
        $match: {
          expiryDate: expired === "1" ? { $lt: today } : { $lte: targetDate },
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
      { $unwind: { path: "$medicine.manufacturer", preserveNullAndEmptyArrays: true } },
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
