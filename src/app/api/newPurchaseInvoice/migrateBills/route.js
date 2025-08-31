import dbConnect from "@/app/lib/Mongodb";
import PendingPurchaseInvoice from "@/app/models/PendingPurchaseInvoice";
import PurchaseInvoice from "@/app/models/PurchaseInvoice";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    // saare invoices jinke pass billImageId hai aur billImageIds abhi empty hai
    const invoices = await PurchaseInvoice.find({
      billImageId: { $exists: true, $ne: null },
    });
    const pendingInvoices = await PendingPurchaseInvoice.find({
      billImageId: { $exists: true, $ne: null },
    });

    let updatedInvoiceCount = 0;
    let updatedPendingInvoiceCount = 0;

    for (const inv of invoices) {
      // agar already array bana liya gaya h to skip kar do
      if (inv.billImageIds && inv.billImageIds.length > 0) continue;

      inv.billImageIds = [inv.billImageId]; // single ko array me daalna
      //   inv.billImageId = undefined; // optional: purana field remove karna hai to
      await inv.save();
      updatedInvoiceCount++;
    }
    for (const inv of pendingInvoices) {
      // agar already array bana liya gaya h to skip kar do
      if (inv.billImageIds && inv.billImageIds.length > 0) continue;

      inv.billImageIds = [inv.billImageId]; // single ko array me daalna
      //   inv.billImageId = undefined; // optional: purana field remove karna hai to
      await inv.save();
      updatedPendingInvoiceCount++;
    }

    return NextResponse.json(
      {
        success: true,
        message: `Migration done. ${updatedInvoiceCount} invoices updated & ${updatedPendingInvoiceCount} Pendning Invoices Updated.`,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Migration error: ", err);
    return NextResponse.json(
      { success: false, message: "Migration failed" },
      { status: 500 }
    );
  }
}
