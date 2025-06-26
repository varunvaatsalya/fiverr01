import dbConnect from "@/app/lib/Mongodb";
import Medicine from "@/app/models/Medicine";
import { verifyTokenWithLogout } from "@/app/utils/jwt";
import { NextResponse } from "next/server";

export async function GET(req) {
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
  //   const userEditPermission = decoded?.editPermission;
  if (!decoded || !userRole) {
    let res = NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
    res.cookies.delete("authToken");
    return res;
  }
  //   if (userRole !== "admin" && userRole !== "owner" && userRole !== "salesman") {
  //     return NextResponse.json(
  //       { message: "Access denied. admins only.", success: false },
  //       { status: 403 }
  //     );
  //   }

  try {
    const medicines = await Medicine.find({})
      .populate('manufacturer', 'name')
      .populate('salts', 'name')
      .sort({ name: 1 });

    return NextResponse.json({ medicines, success: true }, { status: 200 });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
