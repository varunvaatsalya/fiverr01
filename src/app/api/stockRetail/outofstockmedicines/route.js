import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/Mongodb";
import { verifyTokenWithLogout } from "@/app/utils/jwt";
import Medicine from "@/app/models/Medicine";

export async function GET(req) {
  await dbConnect();
  let letter = req.nextUrl.searchParams.get("letter");
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
  
  if (!["pharmacy", "hospital"].includes(sectionType)) {
    return NextResponse.json(
      { message: "Invalid sectionType.", success: false },
      { status: 400 }
    );
  }
  try {

    const isHospital = sectionType === "hospital";

    const matchNameRegex =
      letter === "#"
        ? /^[^a-zA-Z]/ // names not starting with A-Z or a-z
        : new RegExp("^" + letter, "i");

    const medicines = await Medicine.aggregate([
      {
        $match: {
          name: { $regex: matchNameRegex },
        },
      },
      {
        $lookup: {
          from: isHospital ? "hospitalretailstocks" : "retailstocks",
          let: { medicineId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$medicine", "$$medicineId"] } } },
            { $unwind: "$stocks" },
            {
              $group: {
                _id: "$medicine",
                totalStrips: { $sum: "$stocks.quantity.totalStrips" },
              },
            },
          ],
          as: "retailStockData",
        },
      },
      {
        $lookup: {
          from: isHospital ? "hospitalrequests" : "requests",
          let: { medicineId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$medicine", "$$medicineId"] },
                status: { $in: ["Pending", "Approved"] },
              },
            },
            {
              $project: {
                _id: 1,
                status: 1,
                createdAt: 1,
                enteredRemainingQuantity: 1,
                allocatedStocks: "$approvedQuantity",
              },
            },
          ],
          as: "requests",
        },
      },
      {
        $addFields: {
          minimumStockCount: {
            $cond: {
              if: { $eq: [sectionType, "hospital"] },
              then: "$minimumHospitalStockCount.retails",
              else: "$minimumStockCount.retails",
            },
          },
          maximumStockCount: {
            $cond: {
              if: { $eq: [sectionType, "hospital"] },
              then: "$maximumHospitalStockCount.retails",
              else: "$maximumStockCount.retails",
            },
          },
          totalStrips: {
            $ifNull: [{ $arrayElemAt: ["$retailStockData.totalStrips", 0] }, 0],
          },
        },
      },
      // {
      //   $addFields: {
      //     stripsPerPack: "$packetSize.strips",
      //     totalStrips: {
      //       $ifNull: [{ $arrayElemAt: ["$retailStockData.totalStrips", 0] }, 0],
      //     },
      //   },
      // },
      // {
      //   $addFields: {
      //     minRequiredStrips: {
      //       $cond: {
      //         if: { $eq: [sectionType, "hospital"] },
      //         then: "$minimumHospitalStockCount.retails",
      //         else: "$minimumStockCount.retails",
      //       },
      //     },
      //   },
      // },
      // {
      //   $addFields: {
      //     totalRetailStock: {
      //       $round: [{ $divide: ["$totalStrips", "$stripsPerPack"] }, 0],
      //     },
      //     minimumStockCount: {
      //       $cond: {
      //         if: isHospital,
      //         then: {
      //           retails: {
      //             $round: [
      //               {
      //                 $divide: [
      //                   "$minimumHospitalStockCount.retails",
      //                   "$packetSize.strips",
      //                 ],
      //               },
      //               0,
      //             ],
      //           },
      //         },
      //         else: {
      //           retails: {
      //             $round: [
      //               {
      //                 $divide: [
      //                   "$minimumStockCount.retails",
      //                   "$packetSize.strips",
      //                 ],
      //               },
      //               0,
      //             ],
      //           },
      //         },
      //       },
      //     },
      //     maximumStockCount: {
      //       $cond: {
      //         if: isHospital,
      //         then: {
      //           retails: {
      //             $round: [
      //               {
      //                 $divide: [
      //                   "$maximumHospitalStockCount.retails",
      //                   "$packetSize.strips",
      //                 ],
      //               },
      //               0,
      //             ],
      //           },
      //         },
      //         else: {
      //           retails: {
      //             $round: [
      //               {
      //                 $divide: [
      //                   "$maximumStockCount.retails",
      //                   "$packetSize.strips",
      //                 ],
      //               },
      //               0,
      //             ],
      //           },
      //         },
      //       },
      //     },
      //   },
      // },
      //{
      //   $match: {
      //     $or: [
      //       {
      //         $expr: {
      //           $lt: ["$totalStrips", "$minRequiredStrips"],
      //         },
      //       },
      //       {
      //         $expr: {
      //           $gt: [{ $size: "$requests" }, 0],
      //         },
      //       },
      //     ],
      //   },
      // },
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
        $project: {
          name: 1,
          manufacturer: { $arrayElemAt: ["$manufacturer.name", 0] },
          salts: { $arrayElemAt: ["$salts.name", 0] },
          packetSize: 1,
          isTablets: 1,
          unitLabels: 1,
          status: 1,
          // minRequiredStrips: 1,
          // totalRetailStock: 1,
          minimumStockCount: 1,
          maximumStockCount: 1,
          totalStrips: 1,
          requests: 1,
        },
      },
      { $sort: { name: 1 } },
    ]);

    return NextResponse.json(
      {
        medicines,
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
