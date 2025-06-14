import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyTokenWithLogout } from "../../utils/jwt";
import Medicine from "../../models/Medicine";
import { Stock, HospitalStock } from "../../models/Stock";
import Request, { HospitalRequest } from "../../models/Request";
import { Manufacturer } from "../../models/MedicineMetaData";
import RetailStock, { HospitalRetailStock } from "../../models/RetailStock";

export async function GET(req) {
  await dbConnect();
  let id = req.nextUrl.searchParams.get("id");
  let pending = req.nextUrl.searchParams.get("pending");
  let page = req.nextUrl.searchParams.get("page");
  let sectionType = req.nextUrl.searchParams.get("sectionType");

  const token = req.cookies.get("authToken");
  if (!token) {
    console.log("Token not found. Redirecting to login.");
    return NextResponse.json(
      { message: "Access denied. No token provided.", success: false },
      { status: 401 }
    );
  }

  const RequestModel = sectionType === "hospital" ? HospitalRequest : Request;

  const StockModel = sectionType === "hospital" ? HospitalStock : Stock;

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

  try {
    if (id) {
      // Step 1: Fetch the request details
      const request = await RequestModel.findById(id).populate({
        path: "medicine",
        populate: { path: "salts", select: "name" },
      });
      if (!request) {
        return NextResponse.json(
          {
            message: "Request not found",
            success: false,
          },
          { status: 404 }
        );
      }

      const { requestedQuantity, medicine } = request;

      // Fetch the total quantity requested (converted into strips)
      const packetSize = medicine.packetSize.strips;
      const totalRequestedStrips = requestedQuantity * packetSize;

      // Step 2: Fetch all stocks for the given medicine, sorted by oldest first (FIFO)
      const stocks = await StockModel.find({
        medicine: medicine._id,
        "quantity.totalStrips": { $gt: 0 },
      })
        .sort({ createdAt: 1 })
        .select("quantity remainingStrips batchName expiryDate createdAt");

      if (!stocks || stocks.length === 0) {
        return NextResponse.json(
          {
            message: "No stock available for this medicine",
            success: false,
          },
          { status: 404 }
        );
      }

      let remainingStrips = totalRequestedStrips;
      const allocatedStocks = [];

      // Step 3: Allocate the quantity from stocks using FIFO logic
      for (const stock of stocks) {
        if (remainingStrips <= 0) break;

        const availableStrips = stock.quantity.totalStrips;
        const allocatedStrips = Math.min(availableStrips, remainingStrips);

        allocatedStocks.push({
          stockId: stock._id,
          batchName: stock.batchName,
          expiryDate: stock.expiryDate,
          createdAt: stock.createdAt,
          allocatedQuantity: {
            totalStrips: allocatedStrips,
            boxes: Math.floor(allocatedStrips / packetSize),
            extraStrips: allocatedStrips % packetSize,
          },
        });

        remainingStrips -= allocatedStrips;
      }

      // if (remainingStrips > 0) {
      //   return NextResponse.json(
      //     {
      //       message: "Insufficient stock to fulfill this request",
      //       success: false,
      //     },
      //     { status: 400 }
      //   );
      // }

      // Step 4: Respond with the allocation details
      return NextResponse.json(
        {
          allocatedStocks,
          request,
          status: remainingStrips > 0 ? "Partially Fullfilled" : "Fullfilled",
          message: "Allocation details fetched successfully",
          success: true,
        },
        { status: 200 }
      );
    }

    if (pending === "1") {
      let query = { status: { $in: ["Pending", "Approved"] } };

      let requests = await RequestModel.find(query).populate({
        path: "medicine",
        select: "name _id",
        populate: {
          path: "manufacturer",
          model: Manufacturer,
        },
      });

      return NextResponse.json(
        {
          requests,
          success: true,
        },
        { status: 200 }
      );
    }

    page = parseInt(page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    let requests = await RequestModel.find()
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "medicine",
        select: "name _id",
        populate: {
          path: "manufacturer",
          model: Manufacturer,
        },
      });

    const totalRequests = await RequestModel.countDocuments();

    return NextResponse.json(
      {
        requests,
        totalPages: Math.ceil(totalRequests / limit),
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
  if (userRole !== "admin" && userRole !== "dispenser") {
    return NextResponse.json(
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }

  const { requests, sectionType } = await req.json();

  try {
    if (!Array.isArray(requests) || requests.length === 0) {
      return NextResponse.json(
        { message: "Requests array is required", success: false },
        { status: 400 }
      );
    }

    let responses = [];

    for (const request of requests) {
      const {
        medicine,
        medicineName,
        enteredRemainingQuantity,
        requestedQuantity,
        notes,
      } = request;

      if (!medicine || !requestedQuantity || !enteredRemainingQuantity) {
        responses.push({
          medicine,
          medicineName,
          message: "Details are required",
          success: false,
        });
        continue;
      }

      let medicineData = await Medicine.findById(medicine);
      console.log(medicine, medicineData);
      if (!medicineData) {
        responses.push({
          medicine,
          medicineName,
          message: "Medicine not found",
          success: false,
        });
        continue;
      }

      const StockModel = sectionType === "hospital" ? HospitalStock : Stock;

      const stocks = await StockModel.find({ medicine });

      if (!stocks || stocks.length === 0) {
        responses.push({
          medicine,
          medicineName,
          message: "No stock available in godown for this medicine",
          success: false,
        });
        continue;
      }

      const totalAvailableStrips = stocks.reduce((total, stock) => {
        return total + stock.quantity.totalStrips;
      }, 0);

      if (totalAvailableStrips === 0) {
        responses.push({
          medicine,
          medicineName,
          message: "No stock available in godown for this medicine",
          success: false,
        });
        continue;
      }

      const RetailStockModel = sectionType === "hospital" ? HospitalRetailStock : RetailStock;

      const retailStocks = await RetailStockModel.find({ medicine });
      const totalRetailBoxes = retailStocks.reduce((total, retailStock) => {
        return (
          total +
          retailStock.stocks.reduce(
            (boxSum, stock) => boxSum + stock.quantity.boxes,
            0
          )
        );
      }, 0);
      console.log(enteredRemainingQuantity, totalRetailBoxes);

      let isDisputed = Number(enteredRemainingQuantity) != totalRetailBoxes;
      let status = isDisputed ? "Disputed" : "Pending";

      const RequestModel =
        sectionType === "hospital" ? HospitalRequest : Request;

      let newMedicineStockRequest = new RequestModel({
        medicine,
        enteredRemainingQuantity,
        actualRemainingQuantity: totalRetailBoxes,
        requestedQuantity,
        notes,
        status,
      });

      await newMedicineStockRequest.save();

      responses.push({
        medicine,
        medicineName,
        newMedicineStockRequest,
        message: isDisputed
          ? "Error in request please contact to admin or owner."
          : "Request Created Successfully!",
        success: isDisputed ? false : true,
      });
    }

    return NextResponse.json({ responses, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error during processing requests:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  let id = req.nextUrl.searchParams.get("id");
  let sectionType = req.nextUrl.searchParams.get("sectionType");

  if (!sectionType) {
    return NextResponse.json(
      { message: "Invalid Params.", success: false },
      { status: 404 }
    );
  }

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
  const RequestModel = sectionType === "hospital" ? HospitalRequest : Request;
  try {
    if (id) {
      let request = await RequestModel.findByIdAndUpdate(
        id,
        { status: "Rejected" },
        { new: true } // Return the updated document
      );

      if (!request) {
        return NextResponse.json(
          {
            message: "Request not found",
            success: false,
          },
          { status: 404 }
        );
      } else {
        return NextResponse.json(
          {
            message: "Request status updated to Rejected successfully",
            success: true,
            request,
          },
          { status: 200 }
        );
      }
    } else {
      return NextResponse.json(
        {
          message: "Request ID is missing",
          success: false,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error updating request status:", error);
    return NextResponse.json(
      {
        message: "Internal server error.",
        success: false,
      },
      { status: 500 }
    );
  }
}
