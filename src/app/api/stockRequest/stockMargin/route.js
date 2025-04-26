import { NextResponse } from "next/server";
import dbConnect from "../../../lib/Mongodb";
import { verifyTokenWithLogout } from "../../../utils/jwt";
import Medicine from "../../../models/Medicine";
import Stock from "../../../models/Stock";
import mongoose from "mongoose";

export async function POST(req) {
  await dbConnect();
  // let medicineId = req.nextUrl.searchParams.get("medicineId");

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

  const { manufacturer, salt } = await req.json();

  if (!manufacturer && !salt) {
    return NextResponse.json(
      { error: "manufacturer or salt is required" },
      { status: 400 }
    );
  }

  try {
    const medicineFilter = {};
    if (manufacturer)
      medicineFilter.manufacturer = new mongoose.Types.ObjectId(manufacturer);
    if (salt) medicineFilter.salts = new mongoose.Types.ObjectId(salt);

    const medicines = await Medicine.find(medicineFilter)
      .select("_id name manufacturer salts")
      .populate("manufacturer", "_id name")
      .populate("salts", "_id name");

    if (!medicines.length) {
      return NextResponse.json({ data: [] });
    }

    const medicineMap = {};
    medicines.forEach((med) => {
      medicineMap[med._id.toString()] = {
        _id: med._id,
        name: med.name,
        manufacturer: med.manufacturer,
        salt: med.salts || "N/A",
        stocks: [],
      };
    });

    const medicineIds = medicines.map((m) => m._id);

    const stockDocs = await Stock.find({ medicine: { $in: medicineIds } })
      .sort({ createdAt: -1 })
      .lean();

    const grouped = {};

    for (const stock of stockDocs) {
      const medId = stock.medicine.toString();
      if (!grouped[medId]) grouped[medId] = [];

      if (grouped[medId].length < 3) {
        const profitAmount = stock.sellingPrice - stock.purchasePrice;
        const profitPercent = parseFloat(
          ((profitAmount / stock.purchasePrice) * 100).toFixed(2)
        );

        grouped[medId].push({
          batchName: stock.batchName,
          purchasePrice: stock.purchasePrice,
          sellingPrice: stock.sellingPrice,
          profitAmount,
          profitPercent,
          createdAt: stock.createdAt,
        });
      }
    }

    const final = Object.keys(grouped).map((medId) => {
      return {
        ...medicineMap[medId],
        stocks: grouped[medId],
      };
    });

    return NextResponse.json(
      {
        reports: final,
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
