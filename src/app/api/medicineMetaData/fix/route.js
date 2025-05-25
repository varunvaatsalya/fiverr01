import { NextResponse } from "next/server";
import { Vendor } from "@/app/models/MedicineMetaData";
import dbConnect from "@/app/lib/Mongodb";

export async function GET(req) {
  await dbConnect();

  try {
    const vendors = await Vendor.find({
      bankDetails: { $exists: true, $type: "object" },
    });

    for (let vendor of vendors) {
      if (!Array.isArray(vendor.bankDetails)) {
        const original = vendor.bankDetails;
        if (original && Object.keys(original).length > 0) {
          vendor.bankDetails = [original];
          await vendor.save();
          console.log(`Migrated vendor: ${vendor.name}`);
        }
      }
    }

    return NextResponse.json(
      { success: true, message: "All vendors updated." },
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
