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
  const userEditPermission = decoded?.editPermission;
  if (!decoded || !userRole) {
    let res = NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
    res.cookies.delete("authToken");
    return res;
  }
  if (
    userRole !== "admin" &&
    !(userRole === "stockist" && userEditPermission)
  ) {
    return NextResponse.json(
      { message: "Access denied.", success: false },
      { status: 403 }
    );
  }

  const retailstockCollection =
    sectionType === "hospital" ? "hospitalretailstocks" : "retailstocks";
  const requestCollection =
    sectionType === "hospital" ? "hospitalrequests" : "requests";

  let regex;
  if (letter === "#") regex = new RegExp("^[^A-Za-z]", "i");
  else regex = new RegExp("^" + letter, "i");

  try {
    const retailStockData = await Medicine.aggregate([
      {
        $match: {
          name: {
            $regex: regex,
          },
        },
      },
      {
        $lookup: {
          from: retailstockCollection, // Changed to retailstocks collection
          localField: "_id",
          foreignField: "medicine",
          as: "retailStocks", // Alias for retail stocks
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
          requests: {
            $filter: {
              input: "$requests",
              as: "request",
              cond: {
                $or: [
                  { $eq: ["$$request.status", "Pending"] },
                  { $eq: ["$$request.status", "Approved"] },
                ],
              },
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
          manufacturer: { $arrayElemAt: ["$manufacturer", 0] },
          salts: 1,
          packetSize: 1,
          unitLabels: 1,
          isTablets: 1,
          status: 1,
          unitLabels: 1,
          minimumStockCount: 1,
          maximumStockCount: 1,
          retailStocks: {
            _id: 1,
            stocks: 1,
            createdAt: 1,
            updatedAt: 1,
          },
          requests: {
            _id: 1,
            requestedQuantity: 1,
            status: 1,
            createdAt: 1,
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
        medicines: retailStockData,
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
