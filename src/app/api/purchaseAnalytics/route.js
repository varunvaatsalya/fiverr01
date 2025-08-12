import dbConnect from "@/app/lib/Mongodb";
import PurchaseInvoice, {
  HospitalPurchaseInvoice,
} from "@/app/models/PurchaseInvoice";
import { verifyTokenWithLogout } from "@/app/utils/jwt";
import { NextResponse } from "next/server";

export async function GET(req) {
  await dbConnect();

  let start = req.nextUrl.searchParams.get("start");
  let end = req.nextUrl.searchParams.get("end");
  let type = req.nextUrl.searchParams.get("type");
  let sectionType = req.nextUrl.searchParams.get("sectionType");

  if (!start || !end) {
    return NextResponse.json(
      {
        message: "Start and end date required",
        success: false,
      },
      { status: 400 }
    );
  }
  console.log(start, end);

  const Model =
    sectionType === "hospital" ? HospitalPurchaseInvoice : PurchaseInvoice;

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
  // if (!decoded || !userRole) {
  //   let res = NextResponse.json(
  //     { message: "Invalid token.", success: false },
  //     { status: 403 }
  //   );
  //   res.cookies.delete("authToken");
  //   return res;
  // }

  try {
    let startDate = new Date(start);
    let endDateFinal = new Date(end);
    endDateFinal.setHours(23, 59, 59, 999); // include whole day

    if (type === "medicine") {
      const data = await Model.aggregate([
        {
          $match: {
            invoiceDate: { $gte: startDate, $lte: endDateFinal },
          },
        },
        {
          $lookup: {
            from: "stocks",
            localField: "stocks.stockId",
            foreignField: "_id",
            as: "stockDetails",
          },
        },
        { $unwind: "$stockDetails" },
        {
          $lookup: {
            from: "medicines", // stock me jo medicine ref h
            localField: "stockDetails.medicine",
            foreignField: "_id",
            as: "medicine",
          },
        },
        { $unwind: "$medicine" },
        {
          $lookup: {
            from: "manufacturers",
            localField: "medicine.manufacturer",
            foreignField: "_id",
            as: "manufacturer",
          },
        },
        { $unwind: "$manufacturer" },
        {
          $lookup: {
            from: "vendors",
            localField: "vendor",
            foreignField: "_id",
            as: "vendor",
          },
        },
        { $unwind: "$vendor" },
        {
          $group: {
            _id: {
              medId: "$medicine._id",
              medName: "$medicine.name",
              mfgName: "$manufacturer.name",
              vendorName: "$vendor.name",
            },
            purchaseCount: { $sum: 1 },
            totalQtyBoxes: { $sum: "$stockDetails.quantity.boxes" },
            totalQtyStrips: { $sum: "$stockDetails.quantity.totalStrips" },
            totalAmount: {
              $sum: {
                $multiply: [
                  "$stockDetails.quantity.totalStrips",
                  "$stockDetails.purchasePrice",
                ],
              },
            },
          },
        },

        // 2nd group: combine vendor stats under each medicine
        {
          $group: {
            _id: {
              medId: "$_id.medId",
              medName: "$_id.medName",
              mfgName: "$_id.mfgName",
            },
            totalQtyBoxes: { $sum: "$totalQtyBoxes" },
            totalQtyStrips: { $sum: "$totalQtyStrips" },
            totalAmount: { $sum: "$totalAmount" },
            vendors: {
              $push: {
                name: "$_id.vendorName",
                purchaseCount: "$purchaseCount",
                totalQtyBoxes: "$totalQtyBoxes",
                totalQtyStrips: "$totalQtyStrips",
                totalAmount: "$totalAmount",
              },
            },
          },
        },

        {
          $project: {
            _id: 0,
            medicineName: "$_id.medName",
            manufacturerName: "$_id.mfgName",
            totalQtyBoxes: 1,
            totalQtyStrips: 1,
            totalAmount: 1,
            vendors: 1,
          },
        },
        { $sort: { medicineName: 1 } },
      ]);

      return NextResponse.json(
        {
          range: { startDate, endDateFinal },
          medicineWise: data,
          success: true,
        },
        { status: 200 }
      );
    }

    const invoices = await Model.find({
      invoiceDate: { $gte: startDate, $lte: endDateFinal },
    })
      .populate("vendor manufacturer")
      .lean();

    let totalInvoices = invoices.length;
    let grandTotal = 0;
    let totalPaid = 0;
    let totalUnpaid = 0;

    const vendorData = {}; // group by vendor or manufacturer

    for (const inv of invoices) {
      grandTotal += inv.grandTotal || 0;

      const paid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
      totalPaid += paid;
      const unpaid = (inv.grandTotal || 0) - paid;
      totalUnpaid += unpaid;

      // Either vendor or manufacturer
      const partyId =
        inv.vendor?._id?.toString() || inv.manufacturer?._id?.toString();
      const partyName = inv.vendor?.name || inv.manufacturer?.name || "Unknown";

      if (!vendorData[partyId]) {
        vendorData[partyId] = {
          name: partyName,
          totalInvoices: 0,
          amount: 0,
          paid: 0,
          unpaid: 0,
        };
      }

      vendorData[partyId].totalInvoices += 1;
      vendorData[partyId].amount += inv.grandTotal || 0;
      vendorData[partyId].paid += paid;
      vendorData[partyId].unpaid += unpaid;
    }

    return NextResponse.json(
      {
        range: { startDate, endDateFinal },
        summary: {
          totalInvoices,
          grandTotal,
          totalPaid,
          totalUnpaid,
        },
        vendorWise: Object.values(vendorData),
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
