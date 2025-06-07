import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyTokenWithLogout } from "../../utils/jwt";
import { Manufacturer, Vendor } from "../../models/MedicineMetaData";
import PurchaseInvoice, {
  HospitalPurchaseInvoice,
} from "../../models/PurchaseInvoice";
import { generateUID } from "../../utils/counter";

// function getGrandTotal(medicineDetails) {
//   const grandTotal = medicineDetails.reduce((grandTotal, medicine) => {
//     if (
//       medicine.allocatedQuantities &&
//       medicine.allocatedQuantities.length > 0
//     ) {
//       const totalPrice = medicine.allocatedQuantities.reduce(
//         (total, batch) => total + batch.price,
//         0
//       );
//       return grandTotal + totalPrice;
//     }
//     return grandTotal;
//   }, 0);
//   return grandTotal;
// }

function getModel(typesectionType) {
  if (typesectionType === "hospital") return HospitalPurchaseInvoice;
  return PurchaseInvoice;
}

export async function GET(req) {
  await dbConnect();

  let info = req.nextUrl.searchParams.get("info");
  let page = req.nextUrl.searchParams.get("page");
  let pending = req.nextUrl.searchParams.get("pending");
  let sectionType = req.nextUrl.searchParams.get("sectionType");

  const Model = getModel(sectionType);

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
  const userEditPermission = decoded?.editPermission;
  if (!decoded || !userRole) {
    let res = NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
    res.cookies.delete("authToken");
    return res;
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

      const prefix = sectionType === "hospital" ? "HI" : "PI";
      let uniqueDigit = generateUID();

      const uniqueID = `${prefix}${uniqueDigit}`;

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

    const STOCK_MODEL = sectionType === "hospital" ? "HospitalStock" : "Stock";

    const allPurchaseInvoices = await Model.find(query)
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
        model: STOCK_MODEL,
        populate: {
          path: "medicine",
          select: "name",
        },
      });

    const totalPurchaseInvoices = await Model.countDocuments();
    console.log("Total Purchase Invoices:", totalPurchaseInvoices);

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
  if (userRole !== "admin" && userRole !== "stockist") {
    return NextResponse.json(
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }

  const { invoiceNumber, type, name, invoiceDate, receivedDate, sectionType } =
    await req.json();

  const Model = getModel(sectionType);
  try {
    let manufacturer;
    let vendor;

    if (type === "manufacturer") manufacturer = name;
    else if (type === "vendor") vendor = name;

    const newPurchaseInvoice = new Model({
      invoiceNumber,
      manufacturer,
      vendor,
      invoiceDate,
      receivedDate,
    });

    // // Save user to the database
    await newPurchaseInvoice.save();

    console.log("New Purchase Invoice created:", newPurchaseInvoice);
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
  if (userRole !== "admin") {
    return NextResponse.json(
      { message: "Access denied. Admins only.", success: false },
      { status: 403 }
    );
  }

  const { id, sectionType } = await req.json();

  const Model = getModel(sectionType);
  if (!id) {
    return NextResponse.json(
      { message: "PurchaseInvoice ID is required", success: false },
      { status: 400 }
    );
  }
  try {
    const deletedPurchaseInvoice = await Model.findByIdAndDelete(id);
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
