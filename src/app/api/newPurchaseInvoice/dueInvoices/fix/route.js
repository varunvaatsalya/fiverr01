import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/Mongodb";
import PurchaseInvoice, { HospitalPurchaseInvoice } from "../../../../models/PurchaseInvoice";
import { Stock, HospitalStock } from "../../../../models/Stock";

export async function GET(req) {
  await dbConnect();

  try {
    async function updateInvoiceAmounts(InvoiceModel, StockModel) {
      const invoices = await InvoiceModel.find({}).lean();

      for (const invoice of invoices) {
        const stockIds = invoice.stocks.map((s) => s.stockId);

        const stocks = await StockModel.find({ _id: { $in: stockIds } });

        const grandTotal = stocks.reduce(
          (sum, s) => sum + (s.totalAmount || 0),
          0
        );

        const discount = invoice.discount || 0;
        const taxes = invoice.taxes || 0;
        const finalAmount = grandTotal - discount + taxes;

        await InvoiceModel.updateOne(
          { _id: invoice._id },
          {
            $set: {
              grandTotal,
              finalAmount,
            },
          }
        );
      }
    }

    // Call for both models
    await updateInvoiceAmounts(PurchaseInvoice, Stock);
    await updateInvoiceAmounts(HospitalPurchaseInvoice, HospitalStock);

    return NextResponse.json(
      { success: true, message: "All invoices updated." },
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
