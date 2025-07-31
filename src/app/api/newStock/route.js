import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyTokenWithLogout } from "../../utils/jwt";
import Medicine from "../../models/Medicine";
import { Stock, HospitalStock } from "../../models/Stock";
import PurchaseInvoice, {
  HospitalPurchaseInvoice,
} from "../../models/PurchaseInvoice";
import PendingPurchaseInvoice from "@/app/models/PendingPurchaseInvoice";

function getInvoiceModel(typesectionType) {
  if (typesectionType === "hospital") return HospitalPurchaseInvoice;
  return PurchaseInvoice;
}

function getStockModel(typesectionType) {
  if (typesectionType === "hospital") return HospitalStock;
  return Stock;
}

export async function GET(req) {
  await dbConnect();
  let letter = req.nextUrl.searchParams.get("letter");
  let batchInfo = req.nextUrl.searchParams.get("batchInfo");
  let sectionType = req.nextUrl.searchParams.get("sectionType");

  const Model = sectionType === "hospital" ? HospitalStock : Stock;
  // const token = req.cookies.get("authToken");
  // if (!token) {
  //   console.log("Token not found. Redirecting to login.");
  //   return NextResponse.json(
  //     { message: "Access denied. No token provided.", success: false },
  //     { status: 401 }
  //   );
  // }

  // const decoded = await verifyTokenWithLogout(token.value);
  // const userRole = decoded?.role;
  // const userEditPermission = decoded?.editPermission;
  // if (!decoded || !userRole) {
  //   let res = NextResponse.json(
  //     { message: "Invalid token.", success: false },
  //     { status: 403 }
  //   );
  //   res.cookies.delete("authToken");
  //   return res;
  // }

  try {
    if (batchInfo === "1") {
      const stocks = await Model.aggregate([
        {
          $lookup: {
            from: "medicines",
            localField: "medicine",
            foreignField: "_id",
            as: "medicineDetails",
          },
        },
        { $unwind: "$medicineDetails" },
        {
          $group: {
            _id: {
              medicineId: "$medicineDetails._id",
              medicine: "$medicineDetails.name",
              packetSize: "$medicineDetails.packetSize",
              isTablets: "$medicineDetails.isTablets",
            },
            stocks: {
              $push: {
                _id: "$_id",
                batchName: "$batchName",
                expiryDate: "$expiryDate",
                quantity: "$quantity",
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            medicine: "$_id.medicine",
            packetSize: "$_id.packetSize",
            medicineId: "$_id.medicineId",
            isTablets: "$_id.isTablets",
            stocks: 1,
          },
        },
        {
          $sort: {
            medicine: 1,
          },
        },
      ]);

      return NextResponse.json(
        {
          stocks,
          accessInfo: { userRole, userEditPermission },
          success: true,
        },
        { status: 200 }
      );
    }

    const stockCollection =
      sectionType === "hospital" ? "hospitalstocks" : "stocks";
    const requestCollection =
      sectionType === "hospital" ? "hospitalrequests" : "requests";

    let regex;
    if (letter === "#") regex = new RegExp("^[^A-Za-z]", "i");
    else regex = new RegExp("^" + letter, "i");

    const medicineStock = await Medicine.aggregate([
      {
        $match: {
          name: {
            $regex: regex,
          },
        },
      },
      {
        $lookup: {
          from: stockCollection,
          localField: "_id",
          foreignField: "medicine",
          as: "stocks",
        },
      },
      {
        $lookup: {
          from: requestCollection,
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
          minimumStockCount: {
            $cond: {
              if: { $eq: [sectionType, "hospital"] },
              then: "$minimumHospitalStockCount",
              else: "$minimumStockCount",
            },
          },
          maximumStockCount: {
            $cond: {
              if: { $eq: [sectionType, "hospital"] },
              then: "$maximumHospitalStockCount",
              else: "$maximumStockCount",
            },
          },
        },
      },
      {
        $project: {
          name: 1,
          manufacturer: { $arrayElemAt: ["$manufacturer.name", 0] },
          salts: { $arrayElemAt: ["$salts.name", 0] },
          packetSize: 1,
          minimumStockCount: 1,
          maximumStockCount: 1,
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

  const decoded = await verifyTokenWithLogout(token.value);
  const userRole = decoded?.role;
  const userId = decoded._id;
  if (!decoded || !userRole) {
    let res = NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
    res.cookies.delete("authToken");
    return res;
  }
  // if (userRole !== "admin") {
  //   return NextResponse.json(
  //     { message: "Access denied. admins only.", success: false },
  //     { status: 403 }
  //   );
  // }

  const { pendingInvoiceId, status, rejectionReason } = await req.json();

  if (!pendingInvoiceId || !status) {
    return NextResponse.json(
      { message: "Pending invoice ID and status are required", success: false },
      { status: 400 }
    );
  }
  if (!["approved", "rejected"].includes(status)) {
    return NextResponse.json(
      { message: "Invalid status value", success: false },
      { status: 400 }
    );
  }
  const pendingInvoice = await PendingPurchaseInvoice.findById(
    pendingInvoiceId
  ).populate({
    path: "stocks.medicine",
    select:
      "name packetSize isTablets latestSource stockHospitalOrderInfo stockOrderInfo",
  });
  if (!pendingInvoice) {
    return NextResponse.json(
      { message: "Pending invoice not found", success: false },
      { status: 404 }
    );
  }
  if (pendingInvoice.status !== "pending") {
    return NextResponse.json(
      { message: "Invoice already processed!", success: false },
      { status: 400 }
    );
  }
  if (status === "rejected") {
    pendingInvoice.status = "rejected";
    pendingInvoice.rejectionReason = rejectionReason;
    await pendingInvoice.save();

    return NextResponse.json(
      { message: "Invoice rejected successfully", success: true },
      { status: 200 }
    );
  }

  const {
    invoiceNumber,
    vendorInvoiceId,
    type,
    source,
    invoiceDate,
    receivedDate,
    isBackDated,
    sectionType,
    stocks,
    billImageId,
    submittedBy,
  } = pendingInvoice;

  if (!["pharmacy", "hospital"].includes(sectionType)) {
    return NextResponse.json(
      {
        message: "Invalid section type. Must be 'pharmacy' or 'hospital'.",
        success: false,
      },
      { status: 400 }
    );
  }
  const StockModel = getStockModel(sectionType);
  const PurchaseInvoiceModel = getInvoiceModel(sectionType);

  try {
    const invoiceExist = await PurchaseInvoiceModel.findOne({ invoiceNumber });

    if (invoiceExist) {
      return NextResponse.json(
        { message: "Invoice number already exists!", success: false },
        { status: 409 } // Conflict
      );
    }

    let savedStocks = []; // for response
    let insertedStocks = []; // in purchase invoice used
    let grandTotal = 0;

    for (const stock of stocks) {
      let medicineData = stock.medicine;
      let batchName = stock.batchName || "N/A";
      let mfgDate = stock.mfgDate;
      let expiryDate = stock.expiryDate;
      let currentQuantity = parseFloat(stock.currentQuantity);
      let quantity = parseFloat(stock.initialQuantity || 0);
      let offer = parseFloat(stock.offer || 0);
      let sellingPrice = parseFloat(stock.sellingPrice || 0);
      let purchasePrice = parseFloat(stock.purchasePrice || 0); // purchase rate (raw)
      let discount = parseFloat(stock.discount || 0);
      let sgst = parseFloat(stock.sgst || 0);
      let cgst = parseFloat(stock.cgst || 0);

      if (purchasePrice > sellingPrice) {
        savedStocks.push({
          medicine: medicineData.name,
          success: false,
          message: ` Selling price should be Greater than purchase price`,
        });
        continue;
      }

      // let medicineData = await Medicine.findById(medicine);
      if (!medicineData) {
        savedStocks.push({
          medicine: medicineData.name,
          success: false,
          message: ` not found`,
        });
        continue;
      }
      let updatedList = medicineData.latestSource || [];

      let stripsPerBox = medicineData.packetSize?.strips;
      let totalQuantity = quantity + offer;
      let boxes = Math.floor(totalQuantity / stripsPerBox);
      let extra = totalQuantity % stripsPerBox;

      let totalAvailableQuantity = isBackDated
        ? currentQuantity
        : totalQuantity;
      let totalAvailableBoxes = Math.floor(
        totalAvailableQuantity / stripsPerBox
      );
      let totalAvailableExtra = totalAvailableQuantity % stripsPerBox;

      let baseAmount = quantity * purchasePrice;

      // Step 3: Apply discount
      let discountAmount = baseAmount * (discount / 100);
      let discountedAmount = baseAmount - discountAmount;

      // Step 4: Apply GST
      let totalGSTPercent = sgst + cgst;
      let gstAmount = discountedAmount * (totalGSTPercent / 100);
      let finalTotalAmount = discountedAmount + gstAmount;

      // Step 5: Net Purchase Rate (includes offer in denominator)
      let totalUnitsReceived = quantity + offer;
      let netPurchaseRate =
        totalUnitsReceived > 0
          ? parseFloat((finalTotalAmount / totalUnitsReceived).toFixed(2))
          : 0;

      // Step 6: Cost Price per unit (excluding offer)
      let costPrice =
        quantity > 0 ? parseFloat((finalTotalAmount / quantity).toFixed(2)) : 0;

      // Step 7: Total Amount
      let totalAmount = parseFloat((costPrice * quantity).toFixed(2));

      let newMedicineStock = new StockModel({
        medicine: medicineData._id,
        batchName,
        mfgDate,
        packetSize: medicineData.packetSize,
        expiryDate,
        purchaseRate: purchasePrice,
        purchasePrice: netPurchaseRate,
        costPrice,
        sellingPrice,
        totalAmount,
        discount,
        taxes: {
          cgst,
          sgst,
        },
        invoiceId: invoiceNumber,
        quantity: {
          boxes: totalAvailableBoxes,
          extra: totalAvailableExtra,
          totalStrips: totalAvailableQuantity,
        },
        initialQuantity: {
          boxes,
          extra,
          offer,
          totalStrips: totalQuantity,
        },
      });
      insertedStocks.push({
        stockId: newMedicineStock._id,
        insertedAt: new Date(),
      });

      await newMedicineStock.save();
      grandTotal += totalAmount;

      updatedList = updatedList.filter(
        (entry) => !entry.sourceId.equals(source)
      );

      updatedList.unshift({ sourceId: source, sourceType: type });

      medicineData.latestSource = updatedList.slice(0, 3);
      if (sectionType === "hospital")
        medicineData.stockHospitalOrderInfo = undefined;
      else medicineData.stockOrderInfo = undefined;

      // 4. Save final medicineData update
      await medicineData.save();

      savedStocks.push({
        medicine: medicineData.name,
        success: true,
        message: ` saved successfully`,
      });
    }

    let manufacturer;
    let vendor;
    if (type === "Manufacturer") manufacturer = source;
    else if (type === "Vendor") vendor = source;

    let invoice = new PurchaseInvoiceModel({
      invoiceNumber,
      vendorInvoiceId,
      manufacturer,
      vendor,
      stocks: insertedStocks,
      grandTotal,
      billImageId,
      invoiceDate,
      receivedDate,
      createdByRole: submittedBy.role,
      createdBy:
        submittedBy.role === "admin" || !submittedBy.id ? null : submittedBy.id,
      reqCreatedAt: pendingInvoice.createdAt,
      approvedByRole: userRole,
      approvedBy: userRole === "admin" || !userId ? null : userId,
    });

    await invoice.save();
    pendingInvoice.status = "approved";
    pendingInvoice.expireAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 days later
    await pendingInvoice.save();

    return NextResponse.json(
      {
        savedStocks,
        message: "Stocks Approved & Added Successfully!",
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
  if (userRole !== "admin" && (userRole !== "stockist" || !userEditPermission)) {
    return NextResponse.json(
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }
  const { stocks, sectionType } = await req.json();

  const Model = sectionType === "hospital" ? HospitalStock : Stock;

  try {
    const failedMedicineNames = [];

    for (const { stockId, totalStrips } of stocks) {
      try {
        const stock = await Model.findById(stockId).populate({
          path: "medicine",
          select: "name packetSize",
        });

        if (!stock || !stock.medicine) {
          failedMedicineNames.push(stock?.medicine?.name || "Unknown Medicine");
          continue;
        }

        const stripsPerBox = stock.medicine.packetSize?.strips;

        if (!stripsPerBox || stripsPerBox <= 0) {
          failedMedicineNames.push(stock.medicine.name);
          continue;
        }

        const boxes = Math.floor(totalStrips / stripsPerBox);
        const extra = totalStrips % stripsPerBox;

        stock.quantity = {
          ...stock.quantity,
          totalStrips,
          boxes,
          extra,
        };

        await stock.save();
      } catch (err) {
        // If even stock or medicine fetching throws error
        failedMedicineNames.push("Unknown Medicine");
      }
    }

    if (failedMedicineNames.length > 0) {
      const uniqueNames = [...new Set(failedMedicineNames)];
      const message = `Failed to update stock for: ${uniqueNames.join(", ")}`;
      return NextResponse.json({ message, success: false }, { status: 207 });
    }

    return NextResponse.json(
      { message: "All stocks updated successfully!", success: true },
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
