import { NextResponse } from "next/server";
import { verifyTokenWithLogout } from "@/app/utils/jwt";
import dbConnect from "@/app/lib/Mongodb";
import { Stock } from "@/app/models";

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
  //   if (userRole !== "admin" && userRole !== "salesman") {
  //     return NextResponse.json(
  //       { message: "Access denied. admins only.", success: false },
  //       { status: 403 }
  //     );
  //   }

  try {
    const { medicines, backDate } = await req.json();
    const date = new Date(backDate);

    const medicineData = await Promise.all(
      medicines.map(async (medId) => {
        // find latest stock before or on backDate
        const stock = await Stock.findOne({
          medicine: medId,
          createdAt: { $lte: date },
        })
          .sort({ createdAt: -1 })
          .lean();

        return {
          medicineId: medId,
          batchName: stock?.batchName ?? "",
          mfgDate: stock?.mfgDate ?? "",
          expiryDate: stock?.expiryDate ?? "",
          purchasePrice: stock?.purchasePrice ?? 1,
          sellingPrice: stock?.sellingPrice ?? "",
        };
      })
    );

    return NextResponse.json(
      {
        medicineData,
        message: "Invoice medicine data fetched successfully",
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
