import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyToken } from "../../utils/jwt";
import Medicine from "../../models/Medicine";
import mongoose from "mongoose";

export async function GET(req) {
  await dbConnect();
  let id = req.nextUrl.searchParams.get("id");

  //   const token = req.cookies.get("authToken");
  //   if (!token) {
  //     console.log("Token not found. Redirecting to login.");
  //     return NextResponse.json(
  //       { message: "Access denied. No token provided.", success: false },
  //       { status: 401 }
  //     );
  //   }

  //   const decoded = await verifyToken(token.value);
  //   const userRole = decoded.role;
  //   if (!decoded || !userRole) {
  //     return NextResponse.json(
  //       { message: "Invalid token.", success: false },
  //       { status: 403 }
  //     );
  //   }

  try {
    const medicinesWithStock = await Medicine.aggregate([
      // Step 1: Filter medicines by manufacturer
      {
        $match: {
          $or: [
            { manufacturer: new mongoose.Types.ObjectId(id) },
            { vendor: new mongoose.Types.ObjectId(id) },
          ],
        },
      },
      // Step 2: Lookup stock details
      {
        $lookup: {
          from: "stocks",
          localField: "_id",
          foreignField: "medicine",
          as: "stocks",
        },
      },
      // Step 3: Add total boxes count
      {
        $addFields: {
          totalBoxes: {
            $sum: "$stocks.quantity.boxes",
          },
        },
      },
      // Step 4: Project the required fields
      {
        $project: {
          _id: 1,
          name: 1,
          medicineType: 1,
          "minimumStockCount.godown": 1,
          totalBoxes: 1,
        },
      },
      // Step 5: Sort by medicine name alphabetically (A-Z)
      {
        $sort: { name: 1 },
      },
    ]);

    return NextResponse.json(
      {
        medicinesWithStock,
        message:
          medicinesWithStock.length > 0
            ? "Medicines fetched successfully"
            : "No Medicine found.",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
