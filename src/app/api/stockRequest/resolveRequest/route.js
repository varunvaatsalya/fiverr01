import { NextResponse } from "next/server";
import dbConnect from "../../../lib/Mongodb";
import { verifyTokenWithLogout } from "../../../utils/jwt";
import { Stock, HospitalStock } from "../../../models/Stock";
import Request, { HospitalRequest } from "../../../models/Request";
// import RetailStock from "../../../models/RetailStock";
// import Medicine from "../../..//models/Medicine";

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
  // if (userRole !== "admin" && userRole !== "retailer") {
  //   return NextResponse.json(
  //     { message: "Access denied. admins only.", success: false },
  //     { status: 403 }
  //   );
  // }

  const { requestId, sectionType } = await req.json();

  const RequestModel = sectionType === "hospital" ? HospitalRequest : Request;
  const StockModel = sectionType === "hospital" ? HospitalStock : Stock;

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
    const request = await RequestModel.findById(requestId).populate("medicine");
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
    let stocks = await StockModel.find({ medicine }).sort({ expiryDate: 1 });
    const packetSize = medicine.packetSize;

    // let approvedBoxes = 0;
    // let approvedExtra = 0;
    // let approvedTotalStrips = 0;

    let transferredStocks = [];
    let remainingQuantity = requestedQuantity * packetSize.strips;

    // Fulfill the request by transferring stocks`
    for (let stock of stocks) {
      if (remainingQuantity <= 0) break;

      const availableQuantity = stock.quantity.totalStrips;
      // Strips and tabletsPerStrip

      if (availableQuantity > 0) {
        let transferQuantity = Math.min(remainingQuantity, availableQuantity);

        transferredStocks.push({
          stockId: stock._id,
          batchName: stock.batchName,
          expiryDate: stock.expiryDate,
          packetSize,
          quantity: {
            boxes: Math.floor(transferQuantity / packetSize.strips),
            extra: transferQuantity % packetSize.strips,
            totalStrips: transferQuantity,
          },
          purchasePrice: stock.purchasePrice,
          sellingPrice: stock.sellingPrice,
        });

        // approvedBoxes += transferBoxes;
        // approvedExtra += extraStrips;
        // approvedTotalStrips += totalStrips;

        remainingQuantity -= transferQuantity;

        // Update stock in godown
        (stock.quantity.boxes -= Math.floor(
          transferQuantity / packetSize.strips
        )),
          (stock.quantity.extra -= transferQuantity % packetSize.strips),
          (stock.quantity.totalStrips -= transferQuantity);

        await stock.save();
      }
    }

    // Create or update RetailStock for the medicine
    // let retailStock = await RetailStock.findOne({ medicine });

    // if (!retailStock) {
    //   retailStock = new RetailStock({
    //     medicine,
    //     stocks: transferredStocks,
    //   });
    // } else {
    //   retailStock.stocks.push(...transferredStocks);
    // }

    // await retailStock.save();

    // Update the request status and approved quantity
    request.status = "Approved";
    request.approvedAt = new Date();

    request.approvedQuantity = transferredStocks;
    await request.save();

    return NextResponse.json(
      {
        message: "Stock transfer successful",
        success: true,
        transferredStocks,
        request,
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
