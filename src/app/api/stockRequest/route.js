import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/Mongodb";
import { verifyTokenWithLogout } from "@/app/utils/jwt";
import Medicine from "@/app/models/Medicine";
import { Stock, HospitalStock } from "@/app/models/Stock";
import Request, { HospitalRequest } from "@/app/models/Request";
import { Manufacturer } from "@/app/models/MedicineMetaData";
import RetailStock, { HospitalRetailStock } from "@/app/models/RetailStock";
import mongoose from "mongoose";

export async function GET(req) {
  await dbConnect();
  let pending = req.nextUrl.searchParams.get("pending");
  let page = req.nextUrl.searchParams.get("page");
  let status = req.nextUrl.searchParams.get("status");
  let query = req.nextUrl.searchParams.get("query");
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
    if (pending === "1") {
      let query = { status: { $in: ["Pending", "Approved"] } };

      let requests = await RequestModel.find(query).populate({
        path: "medicine",
        select: "name _id",
        populate: {
          path: "manufacturer",
          model: Manufacturer,
          select: "_id name",
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
    query = query || "";

    const matchStage = query
      ? {
          "medicineData.name": { $regex: query, $options: "i" },
        }
      : {};

    if (
      status &&
      [
        "Pending",
        "Approved",
        "Rejected",
        "Disputed",
        "Returned",
        "Fulfilled",
        "Fulfilled (Partial)",
      ].includes(status)
    ) {
      matchStage["status"] = status;
    }

    const pipeline = [
      {
        $sort: { _id: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: "medicines",
          localField: "medicine",
          foreignField: "_id",
          as: "medicineData",
        },
      },
      { $unwind: "$medicineData" },
      {
        $lookup: {
          from: "manufacturers",
          localField: "medicineData.manufacturer",
          foreignField: "_id",
          as: "manufacturerData",
        },
      },
      {
        $unwind: {
          path: "$manufacturerData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: matchStage,
      },
    ];

    let requests = await RequestModel.aggregate(pipeline);
    // const totalRequests = await RequestModel.countDocuments();

    return NextResponse.json(
      {
        requests,
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

    const medicineIds = requests.map(
      (r) => new mongoose.Types.ObjectId(r.medicine)
    );

    const medicinesData = await Medicine.find({
      _id: { $in: medicineIds },
    }).lean();
    const medicineMap = new Map(
      medicinesData.map((m) => [m._id.toString(), m])
    );

    const StockModel = sectionType === "hospital" ? HospitalStock : Stock;
    const stockData = await StockModel.aggregate([
      { $match: { medicine: { $in: medicineIds } } },
      {
        $group: {
          _id: "$medicine",
          totalAvailableStrips: { $sum: "$quantity.totalStrips" },
        },
      },
    ]);
    console.log(medicineIds, stockData);

    const stockMap = new Map(
      stockData.map((s) => [s._id.toString(), s.totalAvailableStrips])
    );

    const RetailStockModel =
      sectionType === "hospital" ? HospitalRetailStock : RetailStock;
    const retailStocks = await RetailStockModel.find({
      medicine: { $in: medicineIds },
    }).lean();

    const retailMap = new Map();
    for (const retail of retailStocks) {
      const medId = retail.medicine.toString();
      const totalStrips = retail.stocks.reduce(
        (sum, s) => sum + (s.quantity?.totalStrips || 0),
        0
      );
      retailMap.set(medId, (retailMap.get(medId) || 0) + totalStrips);
    }

    const RequestModel = sectionType === "hospital" ? HospitalRequest : Request;
    const docsToInsert = [];

    for (const request of requests) {
      let {
        medicine,
        medicineName,
        enteredRemainingQuantity,
        requestedQuantity,
        notes,
      } = request;

      enteredRemainingQuantity = Number(enteredRemainingQuantity);
      requestedQuantity = Number(requestedQuantity);
      console.log(request);

      if (!medicine || !requestedQuantity || enteredRemainingQuantity == null) {
        responses.push({
          medicine,
          medicineName,
          message: "Details are required",
          success: false,
        });
        continue;
      }

      const medIdStr = medicine.toString();

      if (!medicineMap.has(medIdStr)) {
        responses.push({
          medicine,
          medicineName,
          message: "Medicine not found",
          success: false,
        });
        continue;
      }

      const totalAvailableStrips = stockMap.get(medIdStr) || 0;
      if (totalAvailableStrips === 0) {
        responses.push({
          medicine,
          medicineName,
          message: "No stock available in godown for this medicine",
          success: false,
        });
        continue;
      }

      const totalRetailStrips = retailMap.get(medIdStr) || 0;
      let isDisputed = enteredRemainingQuantity != totalRetailStrips;
      let status = isDisputed ? "Disputed" : "Pending";

      const doc = {
        medicine,
        enteredRemainingQuantity,
        actualRemainingQuantity: totalRetailStrips,
        requestedQuantity,
        notes,
        status,
      };
      docsToInsert.push(doc);

      responses.push({
        medicine,
        medicineName,
        newMedicineStockRequest: doc,
        message: isDisputed
          ? "Error in request please contact to admin or owner."
          : "Request Created Successfully!",
        success: !isDisputed,
      });
    }

    if (docsToInsert.length > 0) {
      await RequestModel.insertMany(docsToInsert);
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

  if (!requestId || !sectionType) {
    return NextResponse.json(
      { message: "Invalid Request Data.", success: false },
      { status: 401 }
    );
  }
  const RequestModel = sectionType === "hospital" ? HospitalRequest : Request;

  try {
    let request = await RequestModel.findByIdAndUpdate(
      requestId,
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
    }
    return NextResponse.json(
      {
        message: "Request status updated to Rejected successfully",
        success: true,
        request,
      },
      { status: 200 }
    );
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
