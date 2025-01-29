import { NextResponse } from "next/server";
import dbConnect from "../../../lib/Mongodb";
import { verifyToken } from "../../../utils/jwt";
import Stock from "../../../models/Stock";
import Request from "../../../models/Request";
import RetailStock from "../../../models/RetailStock";
import Medicine from "../../..//models/Medicine";

export async function POST(req) {
  // let manufacturer = req.nextUrl.searchParams.get("manufacturer");

  await dbConnect();

  const token = req.cookies.get("authToken");
  if (!token) {
    console.log("Token not found. Redirecting to login.");
    return NextResponse.json(
      { message: "Access denied. No token provided.", success: false },
      { status: 401 }
    );
  }

  const decoded = await verifyToken(token.value);
  const userRole = decoded.role;
  if (!decoded || !userRole) {
    return NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
  }
  // if (userRole !== "admin" && userRole !== "retailer") {
  //   return NextResponse.json(
  //     { message: "Access denied. admins only.", success: false },
  //     { status: 403 }
  //   );
  // }

  const { requestId } = await req.json();

  try {
    if (!requestId) {
      return NextResponse.json(
        {
          message: "Request ID is required",
          success: false,
        },
        { status: 400 }
      );
    }

    // Find the request by ID
    const request = await Request.findById(requestId).populate("medicine");
    if (!request) {
      return NextResponse.json(
        {
          message: "Request not found",
          success: false,
        },
        { status: 404 }
      );
    }

    if (request.status !== "Pending") {
      return NextResponse.json(
        {
          message: "Request is already processed",
          success: false,
        },
        { status: 400 }
      );
    }

    const { medicine, requestedQuantity } = request;

    // Fetch available godown stock for the requested medicine, sorted by expiryDate
    let stocks = await Stock.find({ medicine }).sort({ expiryDate: 1 });
    let medicineData = await Medicine.findById(medicine);

    let approvedBoxes = 0;
    let approvedExtra = 0;
    let approvedTotalStrips = 0;

    let transferredStocks = [];
    let remainingQuantity = requestedQuantity;

    // Fulfill the request by transferring stocks
    for (let stock of stocks) {
      if (remainingQuantity <= 0) break;

      const availableBoxes = stock.quantity.boxes;
      const packetSize = medicine.packetSize; // Strips and tabletsPerStrip

      if (availableBoxes > 0) {
        let transferBoxes = Math.min(remainingQuantity, availableBoxes);

        let extraStrips = 0;
        if (remainingQuantity - transferBoxes > 0 && stock.quantity.extra > 0) {
          extraStrips = Math.min(
            (remainingQuantity - transferBoxes) * packetSize.strips,
            stock.quantity.extra
          );
        }

        const totalStrips =
          transferBoxes * packetSize.strips + Math.floor(extraStrips);

        transferredStocks.push({
          batchName: stock.batchName,
          expiryDate: stock.expiryDate,
          packetSize: medicineData.packetSize,
          quantity: {
            boxes: transferBoxes,
            extra: extraStrips,
            totalStrips: totalStrips,
          },
          purchasePrice: stock.purchasePrice,
          sellingPrice: stock.sellingPrice,
        });

        approvedBoxes += transferBoxes;
        approvedExtra += extraStrips;
        approvedTotalStrips += totalStrips;

        remainingQuantity -= transferBoxes;

        // Update stock in godown
        stock.quantity.boxes -= transferBoxes;
        stock.quantity.extra -= extraStrips;
        stock.quantity.totalStrips -= totalStrips;

        await stock.save();
      }
    }

    // Create or update RetailStock for the medicine
    let retailStock = await RetailStock.findOne({ medicine });

    if (!retailStock) {
      retailStock = new RetailStock({
        medicine,
        stocks: transferredStocks,
      });
    } else {
      retailStock.stocks.push(...transferredStocks);
    }

    await retailStock.save();

    // Update the request status and approved quantity
    request.status = "Fulfilled";
    request.approvedQuantity = {
      boxes: approvedBoxes,
      extra: approvedExtra,
      totalStrips: approvedTotalStrips,
    };
    await request.save();

    return NextResponse.json(
      {
        message: "Stock transfer successful",
        success: true,
        transferredStocks,
        approvedQuantity: request.approvedQuantity,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error handling stock transfer:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        success: false,
      },
      { status: 500 }
    );
  }
}
