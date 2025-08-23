import dbConnect from "@/app/lib/Mongodb";
import PurchaseInvoice from "@/app/models/PurchaseInvoice";

export async function GET() {
  try {
    await dbConnect();

    // saare invoices jinke pass billImageId hai aur billImageIds abhi empty hai
    const invoices = await PurchaseInvoice.find({
      billImageId: { $exists: true, $ne: null },
    });

    let updatedCount = 0;

    for (const inv of invoices) {
      // agar already array bana liya gaya h to skip kar do
      if (inv.billImageIds && inv.billImageIds.length > 0) continue;

      inv.billImageIds = [inv.billImageId]; // single ko array me daalna
    //   inv.billImageId = undefined; // optional: purana field remove karna hai to
      await inv.save();
      updatedCount++;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Migration done. ${updatedCount} invoices updated.`,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Migration error: ", err);
    return new Response(
      JSON.stringify({ success: false, message: "Migration failed" }),
      { status: 500 }
    );
  }
}
