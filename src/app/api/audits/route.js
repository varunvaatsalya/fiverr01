import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyTokenWithLogout } from "../../utils/jwt";
import AuditTrail from "@/app/models/AuditTrail";

export async function GET(req) {
  await dbConnect();
  let page = req.nextUrl.searchParams.get("page");
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
  if (userRole !== "admin" && userRole !== "owner") {
    return NextResponse.json(
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }

  try {
    page = parseInt(page || "1");
    const limit = 50;
    const skip = (page - 1) * limit;

    const audits = await AuditTrail.find({})
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "resourceId",
        select: "pid inid uhid",
      })
      .populate("editedBy", "name email");

    const totalCount = await AuditTrail.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json(
      { audits, totalPages, success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  await dbConnect();

  const token = req.cookies.get("authToken");
  if (!token) {
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

  if (userRole !== "admin" && userRole !== "owner") {
    return NextResponse.json(
      { message: "Access denied. Admins only.", success: false },
      { status: 403 }
    );
  }

  const { auditId } = await req.json();

  try {
    const deletedAudit = await AuditTrail.findByIdAndDelete(auditId);
    if (!deletedAudit) {
      return NextResponse.json(
        { message: "Audit entry not found.", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Audit entry deleted successfully.", success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting audit entry:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}