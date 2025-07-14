import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyTokenWithLogout } from "../../utils/jwt";
import Medicine from "../../models/Medicine";
import { Stock, HospitalStock } from "../../models/Stock";
import PurchaseInvoice, {
  HospitalPurchaseInvoice,
} from "../../models/PurchaseInvoice";

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
  let batchInfo = req.nextUrl.searchParams.get("batchInfo");
  let sectionType = req.nextUrl.searchParams.get("sectionType");

  const Model = sectionType === "hospital" ? HospitalStock : Stock;
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
          success: true,
        },
        { status: 200 }
      );
    }

    const stockCollection =
      sectionType === "hospital" ? "hospitalstocks" : "stocks";
    const requestCollection =
      sectionType === "hospital" ? "hospitalrequests" : "requests";

    const medicineStock = await Medicine.aggregate([
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
          manufacturer: { $arrayElemAt: ["$manufacturer", 0] }, // Include only one manufacturer
          salts: 1,
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

  const { stocks, invoiceNumber, sectionType } = await req.json();

  const StockModel = getStockModel(sectionType);
  const PurchaseInvoiceModel = getInvoiceModel(sectionType);

  try {
    const invoice = await PurchaseInvoiceModel.findOne({ invoiceNumber });
    if (!invoice) {
      return NextResponse.json(
        { message: "Invoice ID not found!", success: false },
        { status: 404 }
      );
    }
    const sourceId = invoice.vendor ?? invoice.manufacturer;
    const sourceType = invoice.vendor ? "Vendor" : "Manufacturer";

    let savedStocks = [];

    for (const stock of stocks) {
      let medicine = stock.medicine || "";
      let batchName = stock.batchName || "N/A";
      let mfgDate = stock.mfgDate;
      let expiryDate = stock.expiryDate;
      let quantity = parseFloat(stock.quantity || 0);
      let offer = parseFloat(stock.offer || 0);
      let sellingPrice = parseFloat(stock.sellingPrice || 0);
      let purchasePrice = parseFloat(stock.purchasePrice || 0); // purchase rate (raw)
      let discount = parseFloat(stock.discount || 0);
      let sgst = parseFloat(stock.sgst || 0);
      let cgst = parseFloat(stock.cgst || 0);

      if (purchasePrice > sellingPrice) {
        savedStocks.push({
          medicine,
          success: false,
          message: ` Selling price should be Greater than purchase price`,
        });
        continue;
      }

      let medicineData = await Medicine.findById(medicine);
      if (!medicineData) {
        savedStocks.push({
          medicine,
          success: false,
          message: ` not found`,
        });
        continue;
      }
      let updatedList = medicineData.latestSource || [];

      let stripsPerBox = medicineData.packetSize.strips;
      let totalQuantity = quantity + offer;
      let boxes = Math.floor(totalQuantity / stripsPerBox);
      let extra = totalQuantity % stripsPerBox;

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
        medicine,
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
          boxes,
          extra,
          totalStrips: totalQuantity,
        },
        initialQuantity: {
          boxes,
          extra,
          offer,
          totalStrips: totalQuantity,
        },
      });
      invoice.stocks.push({
        stockId: newMedicineStock._id,
        insertedAt: new Date(),
      });

      await newMedicineStock.save();

      updatedList = updatedList.filter(
        (entry) => !entry.sourceId.equals(sourceId)
      );

      updatedList.unshift({ sourceId, sourceType });

      medicineData.latestSource = updatedList.slice(0, 3);
      if (sectionType === "hospital")
        medicineData.stockHospitalOrderInfo = undefined;
      else medicineData.stockOrderInfo = undefined;

      // 4. Save final medicineData update
      await medicineData.save();

      savedStocks.push({
        medicine,
        success: true,
        message: ` saved successfully`,
      });
    }

    invoice.createdBy = userRole === "admin" || !userId ? null : userId;
    invoice.createdByRole = userRole;
    await invoice.save();

    return NextResponse.json(
      { savedStocks, message: "Stocks Added Successfully!", success: true },
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
  if (userRole !== "admin") {
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
