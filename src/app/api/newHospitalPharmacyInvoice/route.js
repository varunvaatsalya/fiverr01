import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/Mongodb";
import { verifyTokenWithLogout } from "@/app/utils/jwt";
import { Patients } from "@/app/models";
import { HospitalRetailStock } from "@/app/models/RetailStock";

export async function GET(req) {
  await dbConnect();

  let info = req.nextUrl.searchParams.get("info");
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
  const userEditPermission = decoded?.editPermission;
  if (!decoded || !userRole) {
    let res = NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
    res.cookies.delete("authToken");
    return res;
  }

  try {
    if (info === "1") {
      let patientsList = await Patients.find({}, "_id name uhid")
        .sort({ _id: -1 })
        .limit(80)
        .exec();

      const medicines = await HospitalRetailStock.find({
        stocks: { $exists: true, $ne: [] },
      })
        .populate({
          path: "medicine",
          select: "_id name isTablets salts",
        })
        .select("medicine");

      const availableMedicines = medicines
        .filter((item) => item.medicine)
        .map((item) => item.medicine);

      return NextResponse.json(
        { patientsList, medicinesList: availableMedicines, success: true },
        { status: 200 }
      );
    }
    // page = parseInt(page) || 1;
    // const limit = 50;
    // const skip = (page - 1) * limit;
    // let query = {};
    // if (pending === "1") {
    //   query = { isDelivered: { $exists: false } };
    // }
    // let userOrderQuery = pending === "1" ? {} : { createdAt: -1 };
    // if (isReturn === "1") {
    //   query.returns = { $exists: true, $not: { $size: 0 } };
    // }
    // const allPharmacyInvoices = await PharmacyInvoice.find(query)
    //   .sort(userOrderQuery)
    //   .skip(skip)
    //   .limit(limit)
    //   .populate({
    //     path: "patientId",
    //     select: "name uhid address age gender mobileNumber",
    //   })
    //   .populate({
    //     path: "medicines.medicineId",
    //     select: "name salts isTablets medicineType packetSize rackPlace",
    //     populate: {
    //       path: "salts",
    //       select: "name",
    //     },
    //   })
    //   .populate({
    //     path: "createdBy",
    //     select: "name email",
    //   });

    // const totalPharmacyInvoices = await PharmacyInvoice.countDocuments();

    return NextResponse.json(
      {
        // allPharmacyInvoices,
        // totalPages: Math.ceil(totalPharmacyInvoices / limit),
        // userRole,
        // userEditPermission,
        message:"Service Unavailable!",
        success: false,
      },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error fetching details:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
