import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/Mongodb";
import { verifyTokenWithLogout } from "@/app/utils/jwt";
import mongoose from "mongoose";
import PurchaseInvoice, { HospitalPurchaseInvoice } from "@/app/models/PurchaseInvoice";

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

  const { inid, source, startDate, endDate, selected, logic, sectionType } =
    await req.json();

  let InvoiceModel =
    sectionType === "hospital" ? HospitalPurchaseInvoice : PurchaseInvoice;

  const matchObj = {};
  try {
    if (inid) {
      matchObj.invoiceNumber = inid;
    }

    if (startDate || endDate) {
      matchObj.createdAt = {};
      if (startDate) matchObj.createdAt.$gte = new Date(startDate);
      if (endDate) matchObj.createdAt.$lte = new Date(endDate);
    }

    const pipeline = [{ $match: matchObj }];

    // Lookup Vendor & Manufacturer
    pipeline.push(
      {
        $lookup: {
          from: "vendors",
          localField: "vendor",
          foreignField: "_id",
          as: "vendorInfo",
        },
      },
      {
        $lookup: {
          from: "manufacturers",
          localField: "manufacturer",
          foreignField: "_id",
          as: "manufacturerInfo",
        },
      }
    );

    // Source filter
    if (source) {
      pipeline.push({
        $match: {
          $or: [
            { "vendorInfo.name": { $regex: source, $options: "i" } },
            { "manufacturerInfo.name": { $regex: source, $options: "i" } },
          ],
        },
      });
    }

    // Lookup Stocks
    pipeline.push({
      $lookup: {
        from: "stocks",
        localField: "stocks.stockId",
        foreignField: "_id",
        as: "stockDocs",
      },
    });

    // Medicine filter
    if (selected?.length) {
      const medicineIds = selected.map(
        (med) => new mongoose.Types.ObjectId(med._id)
      );

      if (logic === "AND") {
        pipeline.push({
          $match: {
            "stockDocs.medicine": { $all: medicineIds },
          },
        });
      } else {
        pipeline.push({
          $match: {
            "stockDocs.medicine": { $in: medicineIds },
          },
        });
      }
    }

    // Only return IDs
    pipeline.push({ $project: { _id: 1 } });

    // --------- Step 3: Run Aggregation ---------
    const filteredInvoices = await InvoiceModel.aggregate(pipeline);

    const ids = filteredInvoices.map((inv) => inv._id);

    if (!ids.length) {
      return NextResponse.json(
        {
          success: true,
          allSearchedPurchaseInvoices: [],
          message: "No invoices found.",
        },
        { status: 200 }
      );
    }

    const query = { _id: { $in: ids } };

    const STOCK_MODEL = sectionType === "hospital" ? "HospitalStock" : "Stock";
    // Fetch data with filters
    const allSearchedPurchaseInvoices = await InvoiceModel.find(query)
      .sort({ _id: -1 })
      .populate({
        path: "manufacturer",
      })
      .populate({
        path: "vendor",
      })
      .populate({
        path: "stocks.stockId",
        model: STOCK_MODEL,
        populate: {
          path: "medicine",
          select: "name",
        },
      })
      .populate({
        path: "billImageId",
      })
      .populate({
        path: "billImageIds",
      })
      .populate({
        path: "createdBy",
        select: "name email",
      })
      .populate({
        path: "approvedBy",
        select: "name email",
      });

    return NextResponse.json(
      { allSearchedPurchaseInvoices, success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
