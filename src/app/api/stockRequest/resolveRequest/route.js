import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/Mongodb";
import { verifyTokenWithLogout } from "@/app/utils/jwt";
import { Stock, HospitalStock } from "@/app/models/Stock";
import Request, { HospitalRequest } from "@/app/models/Request";

async function allocateStocks(medicine, requestedQuantity, StockModel) {
  const packetSize = medicine.packetSize;

  // FIFO: Expiry-date ascending
  const stocks = await StockModel.find({
    medicine: medicine._id,
    "quantity.totalStrips": { $gt: 0 },
  })
    .sort({ expiryDate: 1 })
    .lean();

  let allocatedStocks = [];
  let remainingStrips = requestedQuantity;

  for (let stock of stocks) {
    if (remainingStrips <= 0) break;

    const available = stock.quantity.totalStrips;
    const transferQuantity = Math.min(remainingStrips, available);

    allocatedStocks.push({
      stockId: stock._id,
      batchName: stock.batchName,
      mfgDate: stock.mfgDate,
      expiryDate: stock.expiryDate,
      packetSize,
      available: {
        boxes: Math.floor(available / packetSize.strips),
        extra: available % packetSize.strips,
        totalStrips: available,
      },
      quantity: {
        boxes: Math.floor(transferQuantity / packetSize.strips),
        extra: transferQuantity % packetSize.strips,
        totalStrips: transferQuantity,
      },
      purchasePrice: stock.purchasePrice,
      sellingPrice: stock.sellingPrice,
    });

    remainingStrips -= transferQuantity;
  }

  return { allocatedStocks, remainingStrips };
}

export async function POST(req) {
  await dbConnect();

  const token = req.cookies.get("authToken");
  if (!token) {
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

  const { requests, sectionType } = await req.json();

  if (!Array.isArray(requests) || requests.length === 0) {
    return NextResponse.json(
      { message: "Requests array required", success: false },
      { status: 400 }
    );
  }

  const RequestModel = sectionType === "hospital" ? HospitalRequest : Request;
  const StockModel = sectionType === "hospital" ? HospitalStock : Stock;

  try {
    let results = [];

    for (const reqItem of requests) {
      const { requestId, enteredTransferQty } = reqItem;

      const requestDoc = await RequestModel.findById(requestId).populate({
        path: "medicine",
        select: "_id name packetSize salts",
        populate: { path: "salts", select: "name" },
      });

      if (!requestDoc) {
        results.push({ requestId, error: "Request not found" });
        continue;
      }

      // Quantity: modified or original
      const requestedQuantity =
        enteredTransferQty || requestDoc.requestedQuantity;

      // FIFO Allocation
      const { allocatedStocks, remainingStrips } = await allocateStocks(
        requestDoc.medicine,
        requestedQuantity,
        StockModel
      );

      results.push({
        requestId,
        medicine: requestDoc.medicine.name,
        allocatedStocks,
        remainingStrips,
        status: "Preview",
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Preview fetched",
        stockResults: results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error handling allocation:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        success: false,
      },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  let status = req.nextUrl.searchParams.get("status");
  await dbConnect();

  const token = req.cookies.get("authToken");
  if (!token) {
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

  const { requestId, enteredTransferQty, sectionType } = await req.json();

  if (!requestId || !sectionType) {
    return NextResponse.json(
      { message: "Request details required", success: false },
      { status: 400 }
    );
  }

  const RequestModel = sectionType === "hospital" ? HospitalRequest : Request;
  const StockModel = sectionType === "hospital" ? HospitalStock : Stock;

  try {
    const requestDoc = await RequestModel.findById(requestId).populate({
      path: "medicine",
      select: "_id name packetSize salts",
      populate: { path: "salts", select: "name" },
    });

    if (!requestDoc) {
      return NextResponse.json(
        { message: "Request not found", success: false },
        { status: 404 }
      );
    }

    if (requestDoc.status != "Pending") {
      return NextResponse.json(
        { message: "Request is not eligible for processed!", success: false },
        { status: 400 }
      );
    }
    if (status === "rejected") {
      requestDoc.status = "Rejected";
      await requestDoc.save();
      return NextResponse.json(
        { message: "Request Rejected!", success: true },
        { status: 200 }
      );
    }

    const requestedQuantity =
      enteredTransferQty || requestDoc.requestedQuantity;

    // FIFO Allocation
    const { allocatedStocks, remainingStrips } = await allocateStocks(
      requestDoc.medicine,
      requestedQuantity,
      StockModel
    );
    requestDoc.status = "Approved";
    requestDoc.approvedQuantity = allocatedStocks;
    requestDoc.approvedAt = Date.now();
    await requestDoc.save();

    const bulkOps = allocatedStocks.map((stock) => ({
      updateOne: {
        filter: { _id: stock.stockId },
        update: {
          $inc: {
            "quantity.boxes": -stock.quantity.boxes,
            "quantity.extra": -stock.quantity.extra,
            "quantity.totalStrips": -stock.quantity.totalStrips,
          },
        },
      },
    }));

    if (bulkOps.length > 0) {
      await StockModel.bulkWrite(bulkOps);
    }

    return NextResponse.json(
      {
        success: true,
        request: requestDoc,
        message: "Stock approved successfully!",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error handling allocation:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        success: false,
      },
      { status: 500 }
    );
  }
}
