import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyToken } from "../../utils/jwt";
import { Manufacturer, Vendor } from "../../models/MedicineMetaData";
import PurchaseInvoice from "../../models/PurchaseInvoice";
import { generateUID } from "../../utils/counter";

function getGrandTotal(medicineDetails) {
  const grandTotal = medicineDetails.reduce((grandTotal, medicine) => {
    if (
      medicine.allocatedQuantities &&
      medicine.allocatedQuantities.length > 0
    ) {
      const totalPrice = medicine.allocatedQuantities.reduce(
        (total, batch) => total + batch.price,
        0
      );
      return grandTotal + totalPrice;
    }
    return grandTotal;
  }, 0);
  return grandTotal;
}

function getUID() {
  const prefix = "PI";
  let uniqueDigit = generateUID();

  const uniqueID = `${prefix}${uniqueDigit}`;
  return uniqueID;
}

export async function GET(req) {
  await dbConnect();

  let info = req.nextUrl.searchParams.get("info");
  let page = req.nextUrl.searchParams.get("page");
  let pending = req.nextUrl.searchParams.get("pending");

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
  const userEditPermission = decoded.editPermission;
  if (!decoded || !userRole) {
    return NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
  }

  try {
    if (info === "manufacturer" || info === "vendor") {
      let lists = [];
      if (info === "manufacturer") {
        lists = await Manufacturer.find({}, "_id name")
          .sort({ _id: -1 })
          .exec();
      } else if (info === "vendor") {
        lists = await Vendor.find({}, "_id name").sort({ _id: -1 }).exec();
      }
      let uniqueID = getUID();

      return NextResponse.json(
        { lists, uniqueID, success: true },
        { status: 200 }
      );
    }
    page = parseInt(page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;
    let query = {};
    if (pending === "1") {
      query = { isPaid: { $exists: false } };
    }
    const allPurchaseInvoices = await PurchaseInvoice.find(query)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "manufacturer",
      })
      .populate({
        path: "vendor",
      })
      .populate({
        path: "stocks.stockId",
        select: "medicine totalAmount",
        populate: {
          path: "medicine",
          select: "name",
        },
      });

    const totalPurchaseInvoices = await PurchaseInvoice.countDocuments();

    return NextResponse.json(
      {
        allPurchaseInvoices,
        totalPages: Math.ceil(totalPurchaseInvoices / limit),
        userRole,
        userEditPermission,
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
  if (userRole !== "admin" && userRole !== "stockist") {
    return NextResponse.json(
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }

  const { invoiceNumber, type, name, invoiceDate, receivedDate } =
    await req.json();

  try {
    let manufacturer;
    let vendor;

    if (type === "manufacturer") manufacturer = name;
    else if (type === "vendor") vendor = name;

    const newPurchaseInvoice = new PurchaseInvoice({
      invoiceNumber,
      manufacturer,
      vendor,
      invoiceDate,
      receivedDate,
    });

    // // Save user to the database
    await newPurchaseInvoice.save();

    // Send response with UID
    return NextResponse.json(
      {
        newPurchaseInvoice,
        message: "Invoice Created Successfully!",
        success: true,
      },
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
      { message: "Access denied. Admins only.", success: false },
      { status: 403 }
    );
  }

  const { id } = await req.json();

  try {
    const deletedPurchaseInvoice = await PurchaseInvoice.findByIdAndDelete(id);
    if (!deletedPurchaseInvoice) {
      return NextResponse.json(
        { message: "PurchaseInvoice not found", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Purchase Invoice deleted successfully", success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting admin:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
