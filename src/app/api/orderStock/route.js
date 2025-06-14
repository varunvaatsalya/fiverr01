import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyTokenWithLogout } from "../../utils/jwt";
import OrderHistory, { HospitalOrderHistory } from "../../models/OrderHistory";
import Medicine from "../../models/Medicine";

export async function GET(req) {
  await dbConnect();

  let info = req.nextUrl.searchParams.get("info");
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

  const decoded = await verifyTokenWithLogout(token.value);
  const userRole = decoded?.role;
  if (!decoded || !userRole) {
    return NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
  }

  let OrderHistoryModel =
    sectionType === "hospital" ? HospitalOrderHistory : OrderHistory;
  const stockCollection =
    sectionType === "hospital" ? "hospitalstocks" : "stocks";
  const purchaseInvoiceCollection =
    sectionType === "hospital"
      ? "hospitalpurchaseinvoices"
      : "purchaseinvoices";

  try {
    if (info === "1" && page) {
      page = parseInt(page) || 1;
      const limit = 50;
      const skip = (page - 1) * limit;
      const orderHistory = await OrderHistoryModel.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      const totalOrderHistory = await OrderHistoryModel.countDocuments();
      return NextResponse.json(
        {
          orderHistory,
          totalPages: Math.ceil(totalOrderHistory / limit),
          success: true,
        },
        { status: 200 }
      );
    }

    const medicinesWithStock = await Medicine.aggregate([
      {
        // Lookup all stocks of this medicine
        $lookup: {
          from: stockCollection,
          localField: "_id",
          foreignField: "medicine",
          as: "stockDocs",
        },
      },
      {
        // Calculate totalStrips
        $addFields: {
          totalStrips: {
            $sum: "$stockDocs.quantity.totalStrips",
            // $sum: "$stockDocs.quantity.boxes",
          },
        },
      },
      {
        $lookup: {
          from: purchaseInvoiceCollection,
          let: { medicineId: "$_id" },
          pipeline: [
            { $unwind: "$stocks" },
            {
              $lookup: {
                from: stockCollection,
                localField: "stocks.stockId",
                foreignField: "_id",
                as: "stockDoc",
              },
            },
            { $unwind: "$stockDoc" },
            {
              $match: {
                $expr: {
                  $eq: ["$stockDoc.medicine", "$$medicineId"],
                },
              },
            },
            {
              $sort: { "stocks.insertedAt": -1 },
            },
            { $limit: 1 },

            // Populate vendor
            {
              $lookup: {
                from: "vendors",
                localField: "vendor",
                foreignField: "_id",
                as: "vendorDetails",
              },
            },
            {
              $lookup: {
                from: "manufacturers",
                localField: "manufacturer",
                foreignField: "_id",
                as: "manufacturerDetails",
              },
            },

            {
              $project: {
                vendor: {
                  _id: { $arrayElemAt: ["$vendorDetails._id", 0] },
                  name: { $arrayElemAt: ["$vendorDetails.name", 0] },
                },
                manufacturer: {
                  _id: { $arrayElemAt: ["$manufacturerDetails._id", 0] },
                  name: { $arrayElemAt: ["$manufacturerDetails.name", 0] },
                },
              },
            },
          ],
          as: "latestInvoice",
        },
      },
      {
        $addFields: {
          latestSource: {
            $cond: {
              if: { $gt: [{ $size: "$latestInvoice" }, 0] },
              then: {
                id: {
                  $ifNull: [
                    { $arrayElemAt: ["$latestInvoice.vendor._id", 0] },
                    { $arrayElemAt: ["$latestInvoice.manufacturer._id", 0] },
                  ],
                },
                name: {
                  $ifNull: [
                    { $arrayElemAt: ["$latestInvoice.vendor.name", 0] },
                    { $arrayElemAt: ["$latestInvoice.manufacturer.name", 0] },
                  ],
                },
                type: {
                  $cond: [
                    {
                      $ifNull: [
                        { $arrayElemAt: ["$latestInvoice.vendor._id", 0] },
                        false,
                      ],
                    },
                    "Vendor",
                    "Manufacturer",
                  ],
                },
              },
              else: null,
            },
          },
        },
      },
      {
        $addFields: {
          minimumStockCount: {
            $cond: [
              { $eq: [sectionType, "hospital"] },
              "$minimumHospitalStockCount",
              "$minimumStockCount",
            ],
          },
          maximumStockCount: {
            $cond: [
              { $eq: [sectionType, "hospital"] },
              "$maximumHospitalStockCount",
              "$maximumStockCount",
            ],
          },
        },
      },
      {
        $addFields: {
          latestOffer: {
            $cond: {
              if: { $gt: [{ $size: { $ifNull: ["$offers", []] } }, 0] },
              then: { $arrayElemAt: ["$offers", 0] },
              else: null,
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          packetSize: 1,
          manufacturer: 1,
          salts: 1,
          totalBoxes: { $ifNull: ["$totalStrips", 0] },
          medicineType: 1,
          "minimumStockCount.godown": 1,
          "maximumStockCount.godown": 1,
          stockOrderInfo: 1,
          latestSource: 1,
          latestOffer: 1,
        },
      },
      {
        $sort: { name: 1 },
      },
    ]);

    return NextResponse.json(
      {
        medicinesWithStock,
        message:
          medicinesWithStock.length > 0
            ? "Medicines fetched successfully"
            : "No Medicine found.",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during registration:", error);
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
  // if (userRole !== "admin") {
  //   return NextResponse.json(
  //     { message: "Access denied. Admins only.", success: false },
  //     { status: 403 }
  //   );
  // }
  const { to, mrName, contact, medicines, sectionType } = await req.json();

  try {
    console.log(to, mrName, contact, medicines, sectionType);
    if (!to || !contact) {
      return NextResponse.json(
        {
          message: "Name or contact is blank",
          success: false,
        },
        { status: 400 }
      );
    }

    const invalidMedicines = medicines.filter(
      (medicine) => !medicine.name || !medicine.quantity
    );

    if (invalidMedicines.length > 0) {
      return NextResponse.json(
        {
          message: "Some medicines have blank name or quantity",
          success: false,
        },
        { status: 400 }
      );
    }

    let OrderHistoryModel =
      sectionType === "hospital" ? HospitalOrderHistory : OrderHistory;

    // Create new user
    const newHistory = new OrderHistoryModel({
      to,
      mrName,
      contact,
      medicines,
    });

    // Save History to the database
    await newHistory.save();

    for (const med of medicines) {
      if (!med.medicineId || !med.quantity) continue;

      const updateField =
        sectionType === "hospital"
          ? "stockHospitalOrderInfo"
          : "stockOrderInfo";

      await Medicine.findByIdAndUpdate(med.medicineId, {
        [updateField]: {
          quantity: med.quantity,
          orderedAt: new Date(),
        },
      });
    }

    // Send response with UID
    return NextResponse.json(
      { message: "Order recorded successfully!", success: true },
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
