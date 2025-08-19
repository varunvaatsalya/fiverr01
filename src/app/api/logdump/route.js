import dbConnect from "@/app/lib/Mongodb";
import { NextResponse } from "next/server";
import LoadLog from "@/app/models/LoadLogs";
import { verifyTokenWithLogout } from "@/app/utils/jwt";

export async function GET(req) {
  await dbConnect();

  const sortParam = req.nextUrl.searchParams.get("sortParam");

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
    let pipeline = [
      {
        $group: {
          _id: "$path",
          totalCalls: { $sum: 1 },
          avgDuration: { $avg: "$duration" },
          maxDuration: { $max: "$duration" },
        },
      },
      {
        $project: {
          _id: 0,
          path: "$_id",
          totalCalls: 1,
          avgDuration: 1,
          maxDuration: 1,
        },
      },
    ];

    if (sortParam === "maxDuration" || sortParam === "avgDuration" || sortParam === "totalCalls") {
      pipeline.push({
        $sort: { [sortParam]: -1 }, // sort desc
      });
    }

    const result = await LoadLog.aggregate(pipeline);

    return NextResponse.json({ result, success: true }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
