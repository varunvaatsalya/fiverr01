import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyToken } from "../../utils/jwt";
import Medicine from "../../models/Medicine";
import Stock from "../../models/Stock";
import PurchaseInvoice from "../../models/PurchaseInvoice";

export async function GET(req) {
  await dbConnect();
  let batchInfo = req.nextUrl.searchParams.get("batchInfo");

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

  try {
    if (batchInfo) {
      const stocks = await Stock.find({ medicine: batchInfo }).sort({
        createdAt: -1,
      });
      return NextResponse.json(
        {
          stocks,
          success: true,
        },
        { status: 200 }
      );
    }

    const medicineStock = await Medicine.aggregate([
      {
        $lookup: {
          from: "stocks",
          localField: "_id",
          foreignField: "medicine",
          as: "stocks",
        },
      },
      {
        $lookup: {
          from: "requests",
          localField: "_id",
          foreignField: "medicine",
          as: "requests",
        },
      },
      {
        $lookup: {
          from: "manufacturers",
          localField: "manufacturer",
          foreignField: "_id",
          as: "manufacturer",
        },
      },
      {
        $lookup: {
          from: "salts",
          localField: "salts",
          foreignField: "_id",
          as: "salts",
        },
      },
      {
        $addFields: {
          stocks: {
            $sortArray: {
              input: "$stocks",
              sortBy: { createdAt: -1 },
            },
          },
          requests: {
            $filter: {
              input: "$requests",
              as: "request",
              cond: { $eq: ["$$request.status", "Pending"] },
            },
          },
        },
      },
      {
        $project: {
          name: 1,
          manufacturer: { $arrayElemAt: ["$manufacturer", 0] }, // Include only one manufacturer
          salts: 1,
          packetSize: 1,
          minimumStockCount: 1,
          stocks: {
            _id: 1,
            batchName: 1,
            mfgDate: 1,
            expiryDate: 1,
            quantity: 1,
            purchasePrice: 1,
            sellingPrice: 1,
            createdAt: 1,
          },
          requests: {
            _id: 1,
            requestedQuantity: 1,
            status: 1,
            allocatedStocks: 1,
          },
        },
      },
      {
        $sort: {
          name: 1,
        },
      },
    ]);

    return NextResponse.json(
      {
        medicineStock,
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

  const decoded = await verifyToken(token.value);
  const userRole = decoded.role;
  if (!decoded || !userRole) {
    return NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
  }
  // if (userRole !== "admin") {
  //   return NextResponse.json(
  //     { message: "Access denied. admins only.", success: false },
  //     { status: 403 }
  //   );
  // }
  const {
    medicine,
    batchName,
    mfgDate,
    expiryDate,
    extra,
    purchasePrice,
    quantity,
    sellingPrice,
    invoiceNumber,
  } = await req.json();

  try {
    let medicineData = await Medicine.findById(medicine);
    if (!medicineData) {
      return NextResponse.json(
        { message: "Medicine not found", success: false },
        { status: 404 }
      );
    }
    let stripsPerBox = medicineData.packetSize.strips;
    let totalStrips = quantity * stripsPerBox + extra;

    let newMedicineStock = new Stock({
      medicine,
      batchName,
      mfgDate,
      expiryDate,
      purchasePrice,
      sellingPrice,
      medicine,
      invoiceId: invoiceNumber,
      totalAmount: totalStrips * purchasePrice,
      quantity: {
        boxes: quantity,
        extra,
        totalStrips,
      },
      initialQuantity: {
        boxes: quantity,
        extra,
        totalStrips,
      },
    });
    const invoice = await PurchaseInvoice.findOne({ invoiceNumber });
    if (!invoice) {
      return NextResponse.json(
        { newMedicineStock, message: "Invoice ID not found!", success: false },
        { status: 404 }
      );
    }
    invoice.stocks.push({
      stockId: newMedicineStock._id,
      insertedAt: new Date(),
    });

    await invoice.save();
    await newMedicineStock.save();
    return NextResponse.json(
      { newMedicineStock, message: "Stock Added Successfully!", success: true },
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

export async function PUT(req) {
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
  if (userRole !== "admin") {
    return NextResponse.json(
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }
  const {
    stockId, // Added stockId for identifying the stock to update
    medicine,
    batchName,
    mfgDate,
    expiryDate,
    extra,
    purchasePrice,
    quantity,
    sellingPrice,
  } = await req.json();

  try {
    let medicineStock = await Stock.findById(stockId);
    if (!medicineStock) {
      return NextResponse.json(
        { message: "Stock not found", success: false },
        { status: 404 }
      );
    }

    let medicineData = await Medicine.findById(medicine);
    if (!medicineData) {
      return NextResponse.json(
        { message: "Medicine not found", success: false },
        { status: 404 }
      );
    }

    let stripsPerBox = medicineData.packetSize.strips;
    let totalStrips = quantity * stripsPerBox + extra;

    // Update the necessary fields
    if (medicine) {
      medicineStock.medicine = medicine;
    }
    if (batchName) {
      medicineStock.batchName = batchName;
    }
    if (mfgDate) {
      medicineStock.mfgDate = mfgDate;
    }
    if (expiryDate) {
      medicineStock.expiryDate = expiryDate;
    }
    if (purchasePrice) {
      medicineStock.purchasePrice = purchasePrice;
    }
    if (sellingPrice) {
      medicineStock.sellingPrice = sellingPrice;
    }
    if (quantity) {
      medicineStock.quantity.boxes = quantity;
      medicineStock.quantity.extra = extra;
      medicineStock.quantity.totalStrips = totalStrips;
      medicineStock.initialQuantity.boxes = initialQuantity;
      medicineStock.initialQuantity.extra = extra;
      medicineStock.initialQuantity.totalStrips = totalStrips;
    }

    await medicineStock.save();
    return NextResponse.json(
      { medicineStock, message: "Stock Updated Successfully!", success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during update:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
