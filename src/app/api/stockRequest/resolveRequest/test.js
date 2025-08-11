import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/Mongodb";
import { verifyTokenWithLogout } from "@/app/utils/jwt";
import { Stock, HospitalStock } from "@/app/models/Stock";
import Request, { HospitalRequest } from "@/app/models/Request";

async function allocateStocks(request, StockModel) {
  const { medicine, requestedQuantity } = request;
  const packetSize = medicine.packetSize;

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

    remainingStrips -= transferQuantity;
  }

  return { allocatedStocks, remainingStrips };
}

export async function POST(req) {
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

  const { requestIds, sectionType } = await req.json();

  const RequestModel = sectionType === "hospital" ? HospitalRequest : Request;
  const StockModel = sectionType === "hospital" ? HospitalStock : Stock;

  if (!requestIds || (Array.isArray(requestIds) && requestIds.length === 0)) {
    return NextResponse.json(
      { message: "requestIds required", success: false },
      { status: 400 }
    );
  }

  const ids = Array.isArray(requestIds) ? requestIds : [requestIds];

  try {
    const requests = await RequestModel.find({ _id: { $in: ids } }).populate({
      path: "medicine",
      select: "_id name packetSize salts",
      populate: { path: "salts", select: "name" },
    });

    let results = [];

    for (const request of requests) {
      const { allocatedStocks, remainingStrips } = await allocateStocks(
        request,
        StockModel
      );

      results.push({
        requestId: request._id,
        request,
        allocatedStocks,
        status: remainingStrips > 0 ? "Partially Fulfilled" : "Fulfilled",
      });
    }

    return NextResponse.json(
      {
        message: "Allocation preview fetched successfully",
        success: true,
        data: results,
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

export async function PUT(req) {
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

  const { requestId, sectionType } = await req.json();

  if (!requestId || typeof requestId !== "string") {
    return NextResponse.json(
      { message: "Single requestId required", success: false },
      { status: 400 }
    );
  }

  const RequestModel = sectionType === "hospital" ? HospitalRequest : Request;
  const StockModel = sectionType === "hospital" ? HospitalStock : Stock;

  try {
    const request = await RequestModel.findById(requestId).populate({
      path: "medicine",
      select: "_id name packetSize salts",
      populate: { path: "salts", select: "name" },
    });

    if (!request) {
      return NextResponse.json(
        { message: "Request not found", success: false },
        { status: 404 }
      );
    }

    if (request.status !== "Pending") {
      return NextResponse.json(
        { message: "Request already processed", success: false },
        { status: 400 }
      );
    }

    const { allocatedStocks, remainingStrips } = await allocateStocks(
      request,
      StockModel
    );
    const bulkOps = allocatedStocks.map((stock) => {
      const { boxes, extra, totalStrips } = stock.quantity;
      return {
        updateOne: {
          filter: { _id: stock.stockId },
          update: {
            $inc: {
              "quantity.boxes": -boxes,
              "quantity.extra": -extra,
              "quantity.totalStrips": -totalStrips,
            },
          },
        },
      };
    });

    let bulkResult = { modifiedCount: 0, matchedCount: 0 };

    if (bulkOps.length > 0) {
      bulkResult = await StockModel.bulkWrite(bulkOps);
    }

    request.status = "Approved";
    request.approvedAt = new Date();
    request.approvedQuantity = allocatedStocks;
    await request.save();

    const { modifiedCount, matchedCount } = bulkResult;

    return NextResponse.json(
      {
        message: "Stock transfer completed",
        success: true,
        transferredStocks: allocatedStocks,
        request,
        remainingStrips,
        updateSummary: {
          matchedCount,
          modifiedCount,
          allModified: matchedCount === modifiedCount,
          partialUpdate: matchedCount !== modifiedCount,
        },
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

// import { NextResponse } from "next/server";
// import dbConnect from "@/app/lib/Mongodb";
// import { verifyTokenWithLogout } from "@/app/utils/jwt";
// import { Stock, HospitalStock } from "@/app/models/Stock";
// import Request, { HospitalRequest } from "@/app/models/Request";

/**
 * FIFO allocation function
 */
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

/**
 * Unified POST API for Preview, Approve, Transfer
 */
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

  const { requests, sectionType, action = "preview" } = await req.json();
  // action → "preview", "approve", "transfer"

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

      if (action === "preview") {
        results.push({
          requestId,
          allocatedStocks,
          remainingStrips,
          status: "Preview",
        });
      }

      if (action === "approve") {
        requestDoc.status = "Approved";
        requestDoc.approvedStocks = allocatedStocks;
        await requestDoc.save();

        results.push({
          requestId,
          approvedStocks: allocatedStocks,
          status: "Approved",
        });
      }

      if (action === "transfer") {
        // Deduct stock quantities
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

        requestDoc.status = "Transferred";
        requestDoc.transferredStocks = allocatedStocks;
        await requestDoc.save();

        results.push({
          requestId,
          transferredStocks: allocatedStocks,
          status: "Transferred",
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message:
          action === "preview"
            ? "Preview fetched"
            : action === "approve"
            ? "Requests approved"
            : "Transfer completed",
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
