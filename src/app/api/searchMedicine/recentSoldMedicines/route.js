import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/Mongodb";
import PharmacyInvoice from "@/app/models/PharmacyInvoice";
import { verifyTokenWithLogout } from "@/app/utils/jwt";
import Medicine from "@/app/models/Medicine";

let cache = {
  data: null,
  timestamp: 0,
};

const CACHE_DURATION = 2 * 60 * 60 * 1000;

export async function GET(req) {
  try {
    const now = Date.now();

    if (cache.data && now - cache.timestamp < CACHE_DURATION) {
      console.log(cache.data);
      return NextResponse.json(
        { medicines: cache.data, success: true },
        { status: 200 }
      );
    }

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

    const recentMedicines = await PharmacyInvoice.aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: 200 },
      { $unwind: "$medicines" },
      {
        $group: {
          _id: "$medicines.medicineId",
          latestSoldAt: { $first: "$createdAt" },
        },
      },
      { $sort: { latestSoldAt: -1 } },
      { $limit: 50 },
    ]);

    const medicineIds = recentMedicines.map((m) => m._id);

    const medicines = await Medicine.find({ _id: { $in: medicineIds } })
      .select("_id name")
      .lean();

    cache.data = medicines;
    cache.timestamp = now;

    console.log(medicines, 1);
    return NextResponse.json(
      { success: true, data: medicines },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching top sold medicines:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
