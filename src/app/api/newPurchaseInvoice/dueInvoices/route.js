import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/Mongodb";
import { verifyTokenWithLogout } from "@/app/utils/jwt";
import PurchaseInvoice, {
  HospitalPurchaseInvoice,
} from "@/app/models/PurchaseInvoice";

export async function GET(req) {
  await dbConnect();

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
    let res = NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
    res.cookies.delete("authToken");
    return res;
  }

  const Model =
    sectionType === "hospital" ? HospitalPurchaseInvoice : PurchaseInvoice;

  try {
    const dueInvoices = await Model.aggregate([
      {
        $match: { isPaid: false },
      },
      {
        $addFields: {
          groupBy: {
            $cond: [
              { $ifNull: ["$vendor", false] },
              "$vendor",
              "$manufacturer",
            ],
          },
          isVendor: {
            $cond: [{ $ifNull: ["$vendor", false] }, true, false],
          },
        },
      },
      {
        $group: {
          _id: "$groupBy",
          isVendor: { $first: "$isVendor" },
          invoices: { $push: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "vendors",
          localField: "_id",
          foreignField: "_id",
          as: "vendor",
        },
      },
      {
        $lookup: {
          from: "manufacturers",
          localField: "_id",
          foreignField: "_id",
          as: "manufacturer",
        },
      },
      {
        $addFields: {
          source: {
            $cond: [
              "$isVendor",
              { $arrayElemAt: ["$vendor", 0] },
              { $arrayElemAt: ["$manufacturer", 0] },
            ],
          },
        },
      },
      {
        $project: {
          vendor: 0,
          manufacturer: 0,
        },
      },
      {
        $addFields: {
          totalAmount: {
            $sum: "$invoices.grandTotal",
          },
          paidAmount: {
            $sum: {
              $reduce: {
                input: "$invoices",
                initialValue: 0,
                in: {
                  $add: [
                    "$$value",
                    {
                      $sum: {
                        $map: {
                          input: "$$this.payments",
                          as: "p",
                          in: "$$p.amount",
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $addFields: {
          dueAmount: { $subtract: ["$totalAmount", "$paidAmount"] },
        },
      },
      {
        $sort: {
          dueAmount: -1,
        },
      },
      {
        $project: {
          _id: 0,
          source: 1,
          totalAmount: 1,
          paidAmount: 1,
          dueAmount: 1,
          invoices: {
            $map: {
              input: "$invoices",
              as: "inv",
              in: {
                _id: "$$inv._id",
                invoiceNumber: "$$inv.invoiceNumber",
                invoiceDate: "$$inv.invoiceDate",
                receivedDate: "$$inv.receivedDate",
                finalAmount: "$$inv.finalAmount",
                payments: "$$inv.payments",
                stocks: "$$inv.stocks",
                createdAt: "$$inv.createdAt",
                grandTotal: "$$inv.grandTotal",
                discount: "$$inv.discount",
                taxes: "$$inv.taxes",
              },
            },
          },
        },
      },
    ]);

    return NextResponse.json(
      {
        dueInvoices,
        userRole,
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

  const { selectedInvoices, sharedPaymentInfo, sectionType } = await req.json();

  try {
    if (
      !selectedInvoices ||
      !Array.isArray(selectedInvoices) ||
      selectedInvoices.length === 0
    ) {
      return NextResponse.json(
        { message: "No invoices selected.", success: false },
        { status: 400 }
      );
    }

    const { referenceNumber, date, mode, bankDetails } = sharedPaymentInfo;

    if (!referenceNumber || !date || !mode) {
      return NextResponse.json(
        {
          message: "Reference number, date and mode are required.",
          success: false,
        },
        { status: 400 }
      );
    }
    if (mode === "Bank Transfer" && !bankDetails) {
      return NextResponse.json(
        { error: "Bank details required for bank transfer.", success: false },
        { status: 400 }
      );
    }

    for (const item of selectedInvoices) {
      const { invoiceId, amount } = item;

      if (!amount || amount <= 0) {
        return NextResponse.json(
          { error: `Amount missing in some invoices`, success: false },
          { status: 400 }
        );
      }

      const Model =
        sectionType === "hospital" ? HospitalPurchaseInvoice : PurchaseInvoice;

      const invoice = await Model.findById(invoiceId);

      if (!invoice) {
        return NextResponse.json(
          { error: `Invalid Invoice`, success: false },
          { status: 404 }
        );
      }

      const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
      const newTotalPaid = totalPaid + amount;

      if (newTotalPaid > invoice.grandTotal) {
        return NextResponse.json(
          {
            error: `Payment exceeds grand total in some invoices`,
            success: false,
          },
          { status: 400 }
        );
      }

      invoice.payments.push({
        amount,
        date,
        referenceNumber,
        mode,
        bankDetails: mode === "Bank Transfer" ? bankDetails : undefined,
      });

      if (newTotalPaid >= invoice.grandTotal) {
        invoice.isPaid = true;
      }

      await invoice.save();
    }

    return NextResponse.json(
      { message: "Payment recorded", success: true },
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
