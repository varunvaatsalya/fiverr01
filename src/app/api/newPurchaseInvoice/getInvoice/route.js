import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/Mongodb";
import { verifyTokenWithLogout } from "@/app/utils/jwt";
import PurchaseInvoice, {
  HospitalPurchaseInvoice,
} from "@/app/models/PurchaseInvoice";

function getModel(typesectionType) {
  if (typesectionType === "hospital") return HospitalPurchaseInvoice;
  return PurchaseInvoice;
}

export async function GET(req) {
  await dbConnect();

  let invoiceId = req.nextUrl.searchParams.get("invoiceId");
  let stockId = req.nextUrl.searchParams.get("stockId");
  let sectionType = req.nextUrl.searchParams.get("sectionType");
  console.log(stockId, invoiceId, sectionType);

  const Model = getModel(sectionType);

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

  try {
    let query = {};

    if (invoiceId) {
      query = { invoiceNumber: invoiceId };
    } else if (stockId) {
      query = { "stocks.stockId": stockId };
    }

    const STOCK_MODEL = sectionType === "hospital" ? "HospitalStock" : "Stock";

    const purchaseInvoice = await Model.findOne(query)
      .populate({
        path: "manufacturer",
      })
      .populate({
        path: "vendor",
      })
      .populate({
        path: "stocks.stockId",
        model: STOCK_MODEL,
        populate: {
          path: "medicine",
          select: "name",
        },
      })
      .populate({
        path: "billImageId",
      })
      .populate({
        path: "billImageIds",
      })
      .populate({
        path: "createdBy",
        select: "name email",
      })
      .populate({
        path: "approvedBy",
        select: "name email",
      });

    if (!purchaseInvoice) {
      return NextResponse.json(
        { message: "No Invoice Found", success: false },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        purchaseInvoice,
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
