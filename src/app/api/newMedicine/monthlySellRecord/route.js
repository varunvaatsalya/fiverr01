import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/Mongodb";
import { verifyTokenWithLogout } from "@/app/utils/jwt";
import PharmacyInvoice from "@/app/models/PharmacyInvoice";
import MonthlySellRecord from "@/app/models/MonthlySellRecord";
import SystemConfig from "@/app/models/SystemConfig";

export async function GET(req) {
  await dbConnect();
  let all = req.nextUrl.searchParams.get("all");
  let months = req.nextUrl.searchParams.get("months");

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
    let config = await SystemConfig.findOne({
      key: "lastMonthlySellRecordUpdate",
    });

    if (all === "1") {
      const records = await MonthlySellRecord.find({})
        .sort({ year: -1, month: -1 }) // latest pehle
        .lean();

      return NextResponse.json(
        {
          success: true,
          count: records.length,
          data: records,
          lastUpdated: config?.value || "",
        },
        { status: 200 }
      );
    }
    months = parseInt(months) || 6;
    if (months > 6) months = 6;

    const today = new Date();
    let currentYear = today.getFullYear();
    let currentMonth = today.getMonth() + 1;

    // Build last N months array
    const monthYearArray = [];
    for (let i = 0; i < months; i++) {
      monthYearArray.push({ year: currentYear, month: currentMonth });
      currentMonth--;
      if (currentMonth < 1) {
        currentMonth = 12;
        currentYear--;
      }
    }

    const trends = await MonthlySellRecord.aggregate([
      {
        $match: {
          $or: monthYearArray,
        },
      },
      // Lookup medicine
      {
        $lookup: {
          from: "medicines", // collection name in MongoDB
          localField: "medicineId",
          foreignField: "_id",
          as: "medicine",
        },
      },
      { $unwind: "$medicine" },
      // Lookup salt
      {
        $lookup: {
          from: "salts",
          localField: "medicine.salts",
          foreignField: "_id",
          as: "salt",
        },
      },
      { $unwind: { path: "$salt", preserveNullAndEmptyArrays: true } },
      // Group by medicine
      {
        $group: {
          _id: "$medicine._id",
          medicineName: { $first: "$medicine.name" },
          saltName: { $first: "$salt.name" },
          tabletsPerStrip: { $first: "$medicine.packetSize.tabletsPerStrip" },
          unitLabelLevel1: { $first: "$medicine.unitLabels.level1" },
          monthlyData: {
            $push: {
              year: "$year",
              month: "$month",
              totalSoldTablets: "$totalSoldTablets",
              totalRevenue: "$totalRevenue",
              totalInvoices: "$totalInvoices",
            },
          },
        },
      },
      {
        $project: {
          medicineName: 1,
          saltName: 1,
          unitLabelLevel1: {
            $ifNull: ["$unitLabelLevel1", "pack"],
          },
          monthlyData: {
            $map: {
              input: "$monthlyData",
              as: "m",
              in: {
                year: "$$m.year",
                month: "$$m.month",
                totalSoldTablets: "$$m.totalSoldTablets",
                totalRevenue: "$$m.totalRevenue",
                totalInvoices: "$$m.totalInvoices",
                totalSoldStrips: {
                  $cond: [
                    { $gt: ["$tabletsPerStrip", 0] },
                    { $divide: ["$$m.totalSoldTablets", "$tabletsPerStrip"] },
                    0,
                  ],
                },
              },
            },
          },
        },
      },
      // Sort monthlyData chronologically
      {
        $project: {
          medicineName: 1,
          saltName: 1,
          unitLabelLevel1: 1,
          monthlyData: {
            $sortArray: {
              input: "$monthlyData",
              sortBy: { year: 1, month: 1 },
            },
          },
        },
      },
      { $sort: { medicineName: 1 } },
    ]);

    monthYearArray.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    return NextResponse.json(
      {
        success: true,
        count: trends.length,
        monthYear: monthYearArray,
        trends,
        lastUpdated: config?.value || "",
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
export async function PUT(req) {
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

  if (userRole !== "admin" && userRole !== "owner") {
    return NextResponse.json(
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }

  try {
    let config = await SystemConfig.findOne({
      key: "lastMonthlySellRecordUpdate",
    });
    let lastUpdatedDate = config?.value ? new Date(config.value) : null;

    // Agar pehli baar run ho raha h
    if (!lastUpdatedDate) {
      lastUpdatedDate = new Date("2000-01-01"); // ya koi default old date
    }

    // run on PharmacyInvoice.aggregate(pipeline).allowDiskUse(true)
    const pipeline = [
      {
        $match: { createdAt: { $gte: lastUpdatedDate } },
      },
      // ***********************
      // PART A: SELLING (positive)
      // ***********************
      // unwind medicines + its allocatedStock entries (each allocatedStock is one sold-chunk)
      { $unwind: "$medicines" },
      { $unwind: "$medicines.allocatedStock" },

      // lookup medicine doc to fetch packetSize fallback if needed
      {
        $lookup: {
          from: "medicines",
          localField: "medicines.medicineId",
          foreignField: "_id",
          as: "medicineDoc",
        },
      },
      { $unwind: { path: "$medicineDoc", preserveNullAndEmptyArrays: true } },

      // compute month/year and per-record numeric fields
      {
        $addFields: {
          // month/year based on invoice createdAt (sale time)
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },

          // packet size: prefer allocatedStock.packetSize.tabletsPerStrip else medicineDoc.packetSize.tabletsPerStrip else 1
          tabletsPerStrip: {
            $ifNull: [
              "$medicines.allocatedStock.packetSize.tabletsPerStrip",
              { $ifNull: ["$medicineDoc.packetSize.tabletsPerStrip", 1] },
            ],
          },

          // quantities (safe defaults)
          stripsSold: {
            $ifNull: ["$medicines.allocatedStock.quantity.strips", 0],
          },
          tabletsSold: {
            $ifNull: ["$medicines.allocatedStock.quantity.tablets", 0],
          },

          // selling price is stored at strip level (safe default 0)
          sellingPricePerStrip: {
            $ifNull: ["$medicines.allocatedStock.sellingPrice", 0],
          },

          // id of medicine
          medicineId: "$medicines.medicineId",
        },
      },

      {
        $addFields: {
          discountPercent: { $ifNull: ["$price.discount", 0] },
        },
      },
      {
        $addFields: {
          effectiveSellingPricePerStrip: {
            $multiply: [
              "$sellingPricePerStrip",
              { $subtract: [1, { $divide: ["$discountPercent", 100] }] },
            ],
          },
        },
      },
      // convert to tablets and compute revenue for this allocatedStock entry
      {
        $addFields: {
          totalTablets: {
            $add: [
              { $multiply: ["$stripsSold", "$tabletsPerStrip"] },
              "$tabletsSold",
            ],
          },
          // perTabletPrice: {
          //   $cond: [
          //     { $gt: ["$tabletsPerStrip", 0] },
          //     { $divide: ["$sellingPricePerStrip", "$tabletsPerStrip"] },
          //     0,
          //   ],
          // },
          perTabletPrice: {
            $cond: [
              { $gt: ["$tabletsPerStrip", 0] },
              {
                $divide: ["$effectiveSellingPricePerStrip", "$tabletsPerStrip"],
              },
              0,
            ],
          },
        },
      },
      {
        $addFields: {
          revenue: { $multiply: ["$totalTablets", "$perTabletPrice"] },
        },
      },

      // group sells by medicine+year+month
      {
        $group: {
          _id: { medicineId: "$medicineId", year: "$year", month: "$month" },
          soldTabletsSum: { $sum: "$totalTablets" },
          revenueSum: { $sum: "$revenue" },
          invoiceIds: { $addToSet: "$_id" },
        },
      },
      {
        $project: {
          medicineId: "$_id.medicineId",
          year: "$_id.year",
          month: "$_id.month",
          totalInvoices: { $size: "$invoiceIds" },
          totalSoldTablets: "$soldTabletsSum",
          totalRevenue: "$revenueSum",
          _id: 0,
        },
      },

      // ***************************
      // UNION WITH: RETURNS (negative)
      // ***************************
      {
        $unionWith: {
          coll: "pharmacyinvoices", // same collection
          pipeline: [
            // only invoices having returns
            { $match: { returns: { $exists: true, $ne: [] } } },

            // unwind each return object, then its medicines and their returnStock
            { $unwind: "$returns" },
            { $unwind: "$returns.medicines" },
            { $unwind: "$returns.medicines.returnStock" },

            // lookup medicine doc for packetSize fallback
            {
              $lookup: {
                from: "medicines",
                localField: "returns.medicines.medicineId",
                foreignField: "_id",
                as: "medicineDoc",
              },
            },
            {
              $unwind: {
                path: "$medicineDoc",
                preserveNullAndEmptyArrays: true,
              },
            },

            // compute month/year based on return createdAt (use return time)
            {
              $addFields: {
                year: { $year: "$createdAt" }, // invoice ke createdAt se
                month: { $month: "$createdAt" },

                tabletsPerStrip: {
                  $ifNull: [
                    "$returns.medicines.returnStock.packetSize.tabletsPerStrip",
                    { $ifNull: ["$medicineDoc.packetSize.tabletsPerStrip", 1] },
                  ],
                },

                stripsReturned: {
                  $ifNull: [
                    "$returns.medicines.returnStock.quantity.strips",
                    0,
                  ],
                },
                tabletsReturned: {
                  $ifNull: [
                    "$returns.medicines.returnStock.quantity.tablets",
                    0,
                  ],
                },

                sellingPricePerStrip: {
                  $ifNull: ["$returns.medicines.returnStock.sellingPrice", 0],
                },

                medicineId: "$returns.medicines.medicineId",
              },
            },

            {
              $addFields: {
                discountPercent: { $ifNull: ["$price.discount", 0] },
              },
            },
            {
              $addFields: {
                effectiveSellingPricePerStrip: {
                  $multiply: [
                    "$sellingPricePerStrip",
                    { $subtract: [1, { $divide: ["$discountPercent", 100] }] },
                  ],
                },
              },
            },
            // convert returned to tablets and compute revenue (negative)
            {
              $addFields: {
                totalTabletsReturned: {
                  $add: [
                    { $multiply: ["$stripsReturned", "$tabletsPerStrip"] },
                    "$tabletsReturned",
                  ],
                },
                // perTabletPrice: {
                //   $cond: [
                //     { $gt: ["$tabletsPerStrip", 0] },
                //     { $divide: ["$sellingPricePerStrip", "$tabletsPerStrip"] },
                //     0,
                //   ],
                // },
                perTabletPrice: {
                  $cond: [
                    { $gt: ["$tabletsPerStrip", 0] },
                    {
                      $divide: [
                        "$effectiveSellingPricePerStrip",
                        "$tabletsPerStrip",
                      ],
                    },
                    0,
                  ],
                },
              },
            },
            {
              $addFields: {
                // negative values for return
                totalSoldTablets: { $multiply: [-1, "$totalTabletsReturned"] },
                totalRevenue: {
                  $multiply: [
                    -1,
                    { $multiply: ["$totalTabletsReturned", "$perTabletPrice"] },
                  ],
                },
              },
            },

            // group returns per medicine+year+month
            {
              $group: {
                _id: {
                  medicineId: "$medicineId",
                  year: "$year",
                  month: "$month",
                },
                totalSoldTablets: { $sum: "$totalSoldTablets" }, // negative sums
                totalRevenue: { $sum: "$totalRevenue" }, // negative sums
              },
            },
            {
              $project: {
                medicineId: "$_id.medicineId",
                year: "$_id.year",
                month: "$_id.month",
                totalSoldTablets: 1,
                totalRevenue: 1,
                _id: 0,
              },
            },
          ],
        },
      },

      // ****************************************
      // FINAL: combine sells (+) and returns (-) totals
      // ****************************************
      {
        $group: {
          _id: { medicineId: "$medicineId", year: "$year", month: "$month" },
          totalInvoices: { $sum: "$totalInvoices" },
          totalSoldTablets: { $sum: "$totalSoldTablets" },
          totalRevenue: { $sum: "$totalRevenue" },
        },
      },
      {
        $project: {
          _id: 0,
          medicineId: "$_id.medicineId",
          year: "$_id.year",
          month: "$_id.month",
          totalInvoices: 1,
          totalSoldTablets: 1,
          totalRevenue: 1,
        },
      },
      { $sort: { medicineId: 1, year: 1, month: 1 } },
    ];

    const results = await PharmacyInvoice.aggregate(pipeline)
      .allowDiskUse(true)
      .exec();

    // 3. Bulk upsert into MedicineMonthlySell
    const bulkOps = results.map((r) => ({
      updateOne: {
        filter: { medicineId: r.medicineId, year: r.year, month: r.month },
        update: {
          $set: {
            totalInvoices: Number(r.totalInvoices),
            totalSoldTablets: Math.round(r.totalSoldTablets),
            totalRevenue: Number(r.totalRevenue),
            lastUpdatedAt: new Date(),
          },
        },
        upsert: true,
      },
    }));

    if (bulkOps.length > 0) {
      await MonthlySellRecord.bulkWrite(bulkOps);
    }

    // 4. Update SystemConfig with new last updated date
    const now = new Date();
    await SystemConfig.findOneAndUpdate(
      { key: "lastMonthlySellRecordUpdate" },
      { $set: { value: now } },
      { upsert: true, new: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Sales recalculated successfully",
        updatedRecords: results.length,
        lastUpdated: now,
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
