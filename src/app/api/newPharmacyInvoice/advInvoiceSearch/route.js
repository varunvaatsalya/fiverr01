import { NextResponse } from "next/server";
import dbConnect from "../../../lib/Mongodb";
import PharmacyInvoice from "../../../models/PharmacyInvoice";
import { verifyTokenWithLogout } from "../../../utils/jwt";
import Patients from "../../../models/Patients";
import { Medicine } from "@/app/models";

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

  const {
    patientName,
    uhid,
    startDate,
    endDate,
    inid,
    paymentMode,
    isReturn,
    selected,
    logic,
  } = await req.json();

  try {
    const query = {};
    const pateintQuery = {};

    if (uhid) {
      pateintQuery["uhid"] = { $regex: `^${uhid}`, $options: "i" };
    }

    if (patientName) {
      pateintQuery["name"] = { $regex: patientName, $options: "i" }; // Case-insensitive search
    }

    const matchingPatients = await Patients.find(pateintQuery).select("_id");
    const patientIds = matchingPatients.map((patient) => patient._id);
    if (patientIds.length > 0) {
      query["patientId"] = { $in: patientIds };
    }
    if (inid) {
      query["inid"] = { $regex: `^${inid}`, $options: "i" };
    }

    if (paymentMode) {
      query["paymentMode"] = paymentMode;
    }
    if (isReturn) {
      query.returns = { $exists: true, $not: { $size: 0 } };
    }
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    if (selected.length) {
      const ids = selected.map((m) => m._id);
      if (logic === "AND") {
        query["medicines.medicineId"] = { $all: ids };
      } else {
        query["medicines.medicineId"] = { $in: ids };
      }
    }

    // Fetch data with filters
    const invoices = await PharmacyInvoice.find(query)
      .sort({ _id: -1 })
      .limit(Object.keys(query).length === 0 ? 200 : undefined)
      .populate({
        path: "patientId",
        select: "name uhid address age gender mobileNumber",
      })
      .populate({
        path: "medicines.medicineId",
        select: "name salts isTablets medicineType packetSize rackPlace",
        populate: {
          path: "salts",
          select: "name",
        },
      })
      .populate({
        path: "createdBy",
        select: "name email",
      });

    const medicineStats = [];

    if (selected.length > 0) {
      const medicinesInfo = await Medicine.find({
        _id: { $in: selected },
      }).select("name packetSize.tabletsPerStrip");

      const medicineMap = new Map();
      for (const med of medicinesInfo) {
        medicineMap.set(med._id.toString(), {
          name: med.name,
          tabletsPerStrip: med.packetSize?.tabletsPerStrip || 1,
        });
      }

      // 2. Loop invoices and compute totals
      const statsMap = new Map();

      for (const invoice of invoices) {
        for (const med of invoice.medicines) {
          const medId = med.medicineId._id.toString();
          if (!selected.some((med) => med._id === medId)) continue;

          if (!statsMap.has(medId)) {
            statsMap.set(medId, {
              medicineId: medId,
              name: medicineMap.get(medId)?.name || "",
              totalStrips: 0,
              totalTablets: 0,
              tabletsPerStrip: medicineMap.get(medId)?.tabletsPerStrip || 1,
            });
          }

          const entry = statsMap.get(medId);

          for (const stock of med.allocatedStock) {
            entry.totalStrips += stock.quantity?.strips || 0;
            entry.totalTablets += stock.quantity?.tablets || 0;
          }
        }
      }

      for (const stat of statsMap.values()) {
        const totalEquivalentStrips =
          stat.totalStrips + stat.totalTablets / stat.tabletsPerStrip;
          medicineStats.push({
            medicineId: stat.medicineId,
            name: stat.name,
            totalEquivalentStrips: parseFloat(totalEquivalentStrips.toFixed(2)),
          });
        }
      }
      console.log("result: ", invoices, medicineStats);

    // Send response with UID
    return NextResponse.json(
      { invoices, medicineStats, success: true },
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
