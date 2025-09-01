import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/Mongodb";
import { verifyTokenWithLogout } from "@/app/utils/jwt";
import { Stock, HospitalStock } from "@/app/models/Stock";
import Request, { HospitalRequest } from "@/app/models/Request";
import RetailStock, { HospitalRetailStock } from "@/app/models/RetailStock";

export async function POST(req) {
  let status = req.nextUrl.searchParams.get("status");

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
  if (userRole !== "admin" && userRole !== "dispenser") {
    return NextResponse.json(
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }

  const { requestId, sectionType } = await req.json();

  const StockModel = sectionType === "hospital" ? HospitalStock : Stock;
  const RequestModel = sectionType === "hospital" ? HospitalRequest : Request;
  const RetailStockModel =
    sectionType === "hospital" ? HospitalRetailStock : RetailStock;

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

    if (request.status !== "Approved") {
      return NextResponse.json(
        {
          message: "Request could not be resolved.",
          success: false,
        },
        { status: 400 }
      );
    }

    const { medicine, requestedQuantity, approvedQuantity } = request;

    if (status === "received") {
      let retailStock = await RetailStockModel.findOne({ medicine: medicine._id });

      if (!retailStock) {
        retailStock = new RetailStockModel({
          medicine,
          stocks: approvedQuantity,
        });
      } else {
        retailStock.stocks.push(...approvedQuantity);
      }

      await retailStock.save();

      let approvedStripsQuantity = 0;

      approvedQuantity.forEach((stock) => {
        approvedStripsQuantity += stock.quantity.totalStrips;
      });

      request.receivedStatus = "Fully Received";
      request.receivedAt = new Date();

      request.status =
        approvedStripsQuantity < requestedQuantity
          ? "Fulfilled (Partial)"
          : "Fulfilled";
      await request.save();

      return NextResponse.json(
        {
          message: "Stock transfer successful",
          success: true,
          approvedQuantity: request.approvedQuantity,
        },
        { status: 200 }
      );
    } else if (status === "returned") {
      const invalid = approvedQuantity.some(
        (s) => !s.available || s.available.totalStrips == null
      );

      if (invalid) {
        return NextResponse.json(
          { message: "Available quantity missing in request", success: false },
          { status: 400 }
        );
      }

      const bulkOps = approvedQuantity.map((stock) => {
        const initialTotalStrips = stock.available.totalStrips;
        const initialBoxes = Math.floor(
          initialTotalStrips / stock.packetSize.strips
        );
        const initialExtra = initialTotalStrips % stock.packetSize.strips;

        return {
          updateOne: {
            filter: { _id: stock.stockId },
            update: {
              $set: {
                "quantity.totalStrips": initialTotalStrips,
                "quantity.boxes": initialBoxes,
                "quantity.extra": initialExtra,
              },
            },
          },
        };
      });
      await StockModel.bulkWrite(bulkOps);

      request.status = "Returned";
      request.receivedStatus = "Rejected";
      request.receivedAt = new Date();
      await request.save();

      return NextResponse.json(
        {
          message: "Stock has been returned successfully",
          success: true,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          message: "Invalid params",
          success: false,
        },
        { status: 400 }
      );
    }
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
