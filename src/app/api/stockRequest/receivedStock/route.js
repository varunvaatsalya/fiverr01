import { NextResponse } from "next/server";
import dbConnect from "../../../lib/Mongodb";
import { verifyTokenWithLogout } from "../../../utils/jwt";
import Stock from "../../../models/Stock";
import Request from "../../../models/Request";
import RetailStock from "../../../models/RetailStock";

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

    if (!status) {
      return NextResponse.json(
        {
          message: "Invalid params",
          success: false,
        },
        { status: 400 }
      );
    }
    if (status === "received") {
      let retailStock = await RetailStock.findOne({ medicine });

      if (!retailStock) {
        retailStock = new RetailStock({
          medicine,
          stocks: approvedQuantity,
        });
        console.log("new");
      } else {
        retailStock.stocks.push(...approvedQuantity);
        console.log("push");
      }

      await retailStock.save();

      let approvedBoxQuantity = 0;

      approvedQuantity.forEach((stock) => {
        approvedBoxQuantity += stock.quantity.boxes;
      });

      request.receivedStatus = "Fully Received";
      request.receivedAt = new Date();

      request.status =
        approvedBoxQuantity < requestedQuantity
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
    } else if (status === "rejected") {
      for (const stock of approvedQuantity) {
        await Stock.findByIdAndUpdate(stock.stockId, {
          $inc: {
            "quantity.boxes": stock.quantity.boxes,
            "quantity.extra": stock.quantity.extra || 0,
            "quantity.totalStrips": stock.quantity.totalStrips,
          },
        });
      }

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
