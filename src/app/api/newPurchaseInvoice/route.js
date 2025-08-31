import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/Mongodb";
import { verifyTokenWithLogout } from "@/app/utils/jwt";
import { Manufacturer, Vendor } from "@/app/models/MedicineMetaData";
import PurchaseInvoice, {
  HospitalPurchaseInvoice,
} from "@/app/models/PurchaseInvoice";
import PendingPurchaseInvoice from "@/app/models/PendingPurchaseInvoice";

import { generateUID } from "@/app/utils/counter";
import { Medicine } from "@/app/models";

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

  let sourceType = req.nextUrl.searchParams.get("sourceType");
  let medicinesDetails = req.nextUrl.searchParams.get("medicinesDetails");
  let generateNewId = req.nextUrl.searchParams.get("generateNewId");
  let page = req.nextUrl.searchParams.get("page");
  let pending = req.nextUrl.searchParams.get("pending");
  let sectionType = req.nextUrl.searchParams.get("sectionType");
  let pendingInvoices = req.nextUrl.searchParams.get("pendingInvoices");
  let editInvoice = req.nextUrl.searchParams.get("editInvoice");

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
    if (editInvoice === "1" && sectionType) {
      const rawEditInvoices = await PendingPurchaseInvoice.find({
        status: "editing",
        sectionType,
      })
        .sort({ _id: 1 })
        .populate({
          path: "billImageIds",
        });
      let editInvoices = rawEditInvoices.map((invoice) => ({
        _id: invoice._id,
        invoiceNumber: invoice.invoiceNumber || "",
        vendorInvoiceId: invoice.vendorInvoiceId || "",
        type: invoice.type?.toLowerCase() || "vendor",
        source: invoice.source || "",
        invoiceDate: invoice.invoiceDate
          ? new Date(invoice.invoiceDate).toISOString().substring(0, 10)
          : "",
        receivedDate: invoice.receivedDate
          ? new Date(invoice.receivedDate).toISOString().substring(0, 10)
          : "",
        stocks:
          (invoice.stocks || []).map((stock) => ({
            medicine: stock.medicine || "",
            batchName: stock.batchName || "",
            mfgDate: stock.mfgDate
              ? new Date(stock.mfgDate).toISOString().substring(0, 10)
              : "",
            expiryDate: stock.expiryDate
              ? new Date(stock.expiryDate).toISOString().substring(0, 10)
              : "",
            availableQuantity: invoice.isBackDated
              ? stock.currentQuantity
              : null,
            quantity: stock.initialQuantity || null,
            offer: stock.offer || null,
            sellingPrice: stock.sellingPrice || null,
            purchasePrice: stock.purchasePrice || null,
            discount: stock.discount || null,
            sgst: stock.sgst || null,
            cgst: stock.cgst || null,
          })) || [],
        // billImageId: invoice.billImageId || "",
        billImageIds:
          (invoice.billImageIds || []).map((img) => ({
            _id: img._id,
            url: img.filepath,
          })) || [],
        isBackDated: invoice.isBackDated || false,
      }));

      return NextResponse.json(
        {
          editInvoices,
          success: true,
        },
        { status: 200 }
      );
    }

    if (sourceType === "manufacturer" || sourceType === "vendor") {
      let response = { lists: [] };
      if (sourceType === "manufacturer") {
        response.lists = await Manufacturer.find({}, "_id name")
          .sort({ _id: -1 })
          .exec();
      } else if (sourceType === "vendor") {
        response.lists = await Vendor.find({}, "_id name")
          .sort({ _id: -1 })
          .exec();
      }

      if (medicinesDetails === "1") {
        response.medicines = await Medicine.find()
          .sort({ name: 1 })
          .populate({
            path: "manufacturer",
          })
          .populate({
            path: "salts",
          });
      }

      if (generateNewId === "1") {
        const prefix = sectionType === "hospital" ? "HI" : "PI";
        let uniqueDigit = generateUID();
        response.uniqueID = `${prefix}${uniqueDigit}`;
      }

      return NextResponse.json(
        {
          response,
          success: true,
        },
        { status: 200 }
      );
    }
    if (pendingInvoices === "1") {
      const pendingInvoices = await PendingPurchaseInvoice.find({
        status: "pending",
      })
        .sort({ _id: 1 })
        .populate({
          path: "source",
          select: "name",
        })
        .populate({
          path: "stocks.medicine",
          select: "name packetSize isTablets",
        })
        .populate({
          path: "billImageId",
        })
        .populate({
          path: "billImageIds",
        });
      const editingCount = await PendingPurchaseInvoice.countDocuments({
        status: "editing",
      });
      const rejectedCount = await PendingPurchaseInvoice.countDocuments({
        status: "rejected",
      });

      return NextResponse.json(
        {
          pendingInvoices,
          rejectedCount,
          editingCount,
          success: true,
        },
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
  let editMode = req.nextUrl.searchParams.get("editMode");

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

  const {
    _id,
    stocks,
    invoiceNumber,
    vendorInvoiceId,
    type,
    source,
    invoiceDate,
    receivedDate,
    isBackDated,
    // billImageId,
    billImageIds,
    sectionType,
  } = await req.json();

  if (sectionType !== "hospital" && sectionType !== "pharmacy") {
    return NextResponse.json(
      { message: "Invalid section type.", success: false },
      { status: 400 }
    );
  }

  const formattedType = type.charAt(0).toUpperCase() + type.slice(1);

  let invoice = {
    stocks: stocks.map((stock) => {
      let initialQuantity = Number(stock.quantity) || 0;
      let avlQuantity = Number(stock.availableQuantity) || 0;
      let offer = Number(stock.offer) || 0;
      let currentQuantity = isBackDated ? avlQuantity : initialQuantity + offer;
      return {
        medicine: stock.medicine,
        batchName: stock.batchName || "N/A",
        mfgDate: stock.mfgDate || "",
        expiryDate: stock.expiryDate || "",
        currentQuantity,
        initialQuantity,
        offer,
        sellingPrice: Number(stock.sellingPrice) || 0,
        purchasePrice: Number(stock.purchasePrice) || 0,
        sgst: Number(stock.sgst) || 0,
        cgst: Number(stock.cgst) || 0,
        discount: Number(stock.discount) || 0,
      };
    }),
    invoiceNumber,
    vendorInvoiceId,
    type: formattedType,
    source,
    invoiceDate,
    receivedDate,
    isBackDated,
    billImageIds: billImageIds || [],
    sectionType,
    submittedBy: {
      id: decoded._id,
      email: decoded.email,
      role: decoded.role,
    },
    status: "pending",
  };
  try {
    if (editMode === "1" && _id) {
      let existingInvoice = await PendingPurchaseInvoice.findById(_id);
      if (!existingInvoice) {
        return NextResponse.json(
          { message: "Invoice not found.", success: false },
          { status: 404 }
        );
      }
      if (existingInvoice.status !== "editing") {
        return NextResponse.json(
          {
            message: "Only invoices in 'editing' status can be updated.",
            success: false,
          },
          { status: 400 }
        );
      }
      if (existingInvoice.sectionType !== sectionType) {
        return NextResponse.json(
          { message: "Section type cannot be changed.", success: false },
          { status: 400 }
        );
      }
      // update fields
      Object.assign(existingInvoice, invoice);
      await existingInvoice.save();
      return NextResponse.json(
        {
          message: "Invoice updated successfully.",
          success: true,
          updatedInvoice: existingInvoice,
        },
        { status: 200 }
      );
    }
    const existingInvoice = await PendingPurchaseInvoice.findOne({
      vendorInvoiceId,
    });
    if (existingInvoice) {
      return NextResponse.json(
        {
          message: "Invoice with this Vendor Invoice ID already exists.",
          success: false,
        },
        { status: 400 }
      );
    }
    const Model = getModel(sectionType);
    const existingInMain = await Model.findOne({ vendorInvoiceId });
    if (existingInMain) {
      return NextResponse.json(
        {
          message:
            "Invoice with this Vendor Invoice ID already exists in main records.",
          success: false,
        },
        { status: 400 }
      );
    }
    const newPendingPurchaseInvoice = new PendingPurchaseInvoice(invoice);

    await newPendingPurchaseInvoice.save();

    const prefix = sectionType === "hospital" ? "HI" : "PI";
    let uniqueDigit = generateUID();
    let newUniqueId = `${prefix}${uniqueDigit}`;

    return NextResponse.json(
      {
        newUniqueId,
        newPendingPurchaseInvoice,
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
