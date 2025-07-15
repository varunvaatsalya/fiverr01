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

  const Model =
    sectionType === "hospital" ? HospitalPurchaseInvoice : PurchaseInvoice;

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
    const startDate = new Date(start);
    const endDateFinal = new Date(end);
    endDateFinal.setHours(23, 59, 59, 999); // include whole day

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
