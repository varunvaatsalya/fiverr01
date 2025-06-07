import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyTokenWithLogout } from "../../utils/jwt";
import Medicine from "../../models/Medicine";
import { Stock } from "../../models/Stock";
import RetailStock from "../../models/RetailStock";

export async function GET(req) {
  await dbConnect();
  let letter = req.nextUrl.searchParams.get("letter");

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
  if (!letter || letter.length !== 1) {
    return NextResponse.json(
      {
        message: "Please provide a single letter in query (e.g., ?letter=a)",
        success: false,
      },
      { status: 400 }
    );
  }

  try {
    const regex = new RegExp("^" + letter, "i"); // case-insensitive match

    const medicines = await Medicine.find({ name: { $regex: regex } })
      .populate("manufacturer")
      .populate("salts");

    const result = await Promise.all(
      medicines.map(async (med) => {
        // Retail stock totals
        const retailStock = await RetailStock.findOne({ medicine: med._id });
        const retailTotals = {
          totalBoxes: 0,
          totalExtras: 0,
          totalTablets: 0,
          totalStrips: 0,
        };

        if (retailStock && retailStock.stocks.length > 0) {
          retailStock.stocks.forEach((stock) => {
            retailTotals.totalBoxes += stock.quantity.boxes || 0;
            retailTotals.totalExtras += stock.quantity.extra || 0;
            retailTotals.totalTablets += stock.quantity.tablets || 0;
            retailTotals.totalStrips += stock.quantity.totalStrips || 0;
          });
        }

        // Godown stock totals
        const godownStocks = await Stock.find({ medicine: med._id });
        const godownTotals = {
          totalBoxes: 0,
          totalExtras: 0,
          totalStrips: 0,
        };

        godownStocks.forEach((stock) => {
          godownTotals.totalBoxes += stock.quantity.boxes || 0;
          godownTotals.totalExtras += stock.quantity.extra || 0;
          godownTotals.totalStrips += stock.quantity.totalStrips || 0;
        });

        return {
          medicine: med,
          retailStock: retailTotals,
          godownStock: godownTotals,
        };
      })
    );

    console.log(medicines.length)

    return NextResponse.json(
      { message: "Successfully fetched", success: true, info: result },
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
