import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyToken } from "../../utils/jwt";
import { Bed, Ward } from "../../models/WardsBeds";
import { Surgery, Package } from "../../models/Surgerys";
import Patient from "../../models/Patients";
import Admission from "../../models/Admissions";
import Doctor from "../../models/Doctors";

export async function GET(req) {
  await dbConnect();

  let id = req.nextUrl.searchParams.get("id");

  const token = req.cookies.get("authToken");
  if (!token) {
    console.log("Token not found. Redirecting to login.");
    return NextResponse.json(
      { message: "Access denied. No token provided.", success: false },
      { status: 401 }
    );
  }

  const decoded = await verifyToken(token.value);
  const userRole = decoded.role;
  //   const userEditPermission = decoded.editPermission;
  if (!decoded || !userRole) {
    return NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
  }

  try {
    console.log(id, 1);
    const admission = await Admission.findById(id)
      .populate({
        path: "bedHistory.bed",
        select: "bedName ward price",
        populate: { path: "ward", select: "name" },
      })
      .sort({ _id: -1 })
      .exec();

    const availablebeds = await Bed.find({ isOccupied: false })
      .populate({ path: "ward", select: "name" })
      .exec();

    if (!admission) {
      return NextResponse.json(
        { message: "Admission not found.", success: false },
        { status: 404 }
      );
    }
    const bedHistory = admission.bedHistory.map((bh) => ({
      bedName: bh.bed.bedName,
      ward: bh.bed.ward.name,
      price: bh.bed.price,
      startDate: bh.startDate,
      endDate: bh.endDate,
    }));

    const availableBeds = availablebeds.map((bed) => ({
      _id: bed._id,
      bedName: bed.bedName,
      ward: bed.ward.name,
      price: bed.price,
    }));
    return NextResponse.json(
      { bedHistory, availableBeds, success: true },
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

export async function POST(req) {
  await dbConnect();

  let insurenceInfo = req.nextUrl.searchParams.get("insurenceInfo");
  let othServiceInfo = req.nextUrl.searchParams.get("othServiceInfo");

  const token = req.cookies.get("authToken");
  if (!token) {
    console.log("Token not found. Redirecting to login.");
    return NextResponse.json(
      { message: "Access denied. No token provided.", success: false },
      { status: 401 }
    );
  }

  const decoded = await verifyToken(token.value);
  const userRole = decoded.role;
  if (!decoded || !userRole) {
    return NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
  }
  try {
    if (insurenceInfo == "1") {
      const { id, insurenceDeatils, transaction } = await req.json();
      const admission = await Admission.findById(id);
      if (!admission) {
        return NextResponse.json(
          { message: "Admission not found.", success: false },
          { status: 404 }
        );
      }
      const { providerName, tpa, coverageAmount } = insurenceDeatils;
      const { amount, txno, bankName } = transaction;
      console.log(providerName, tpa, coverageAmount, amount, txno, bankName, 1);

      if (!admission.insuranceInfo) admission["insuranceInfo"] = {};

      admission.insuranceInfo.providerName = providerName;
      admission.insuranceInfo.tpa = tpa;
      admission.insuranceInfo.coverageAmount = coverageAmount;

      if (amount && txno && bankName) {
        admission.insuranceInfo.payments.push(transaction);
      }
      await admission.save();
      const updatedAdmission = await Admission.findById(id);
      return NextResponse.json(
        {
          transaction: updatedAdmission.insuranceInfo.payments,
          success: true,
          message: "Saved Successfully",
        },
        { status: 201 }
      );
    }

    if (othServiceInfo == "1") {
      const { id, othServices } = await req.json();
      const admission = await Admission.findById(id);
      if (!admission) {
        return NextResponse.json(
          { message: "Admission not found.", success: false },
          { status: 404 }
        );
      }
      othServices.date = Date.now();
      admission.otherServices.push(othServices);
      await admission.save();
      const updatedAdmission = await Admission.findById(id);
      return NextResponse.json(
        {
          otherServices: updatedAdmission.otherServices,
          success: true,
          message: "Saved Successfully",
        },
        { status: 201 }
      );
    }

    const { id, surgerys, packages, doctors, reason } = await req.json();
    const admission = await Admission.findById(id);
    if (!admission) {
      return NextResponse.json(
        { message: "Admission not found.", success: false },
        { status: 404 }
      );
    }
    if (doctors.length > 0) {
      doctors.forEach((doctorId) => {
        admission.doctor.push({ doctor: doctorId, visitingDate: Date.now() });
      });
    }
    if (surgerys.length > 0) {
      surgerys.forEach((surgeryId) => {
        admission.surgery.push({ surgery: surgeryId, date: Date.now() });
      });
    }
    if (packages.length > 0) {
      packages.forEach((packageId) => {
        admission.package.push({ package: packageId, date: Date.now() });
      });
    }
    if (reason) {
      admission.reason = reason;
    }

    await admission.save();
    const updatedAdmission = await Admission.findById(id);
    return NextResponse.json(
      {
        doctors: updatedAdmission.doctor,
        surgerys: updatedAdmission.surgery,
        packages: updatedAdmission.package,
        success: true,
        message: "Saved Successfully",
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
