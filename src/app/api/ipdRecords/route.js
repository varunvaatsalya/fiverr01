import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyTokenWithLogout } from "../../utils/jwt";
import Admission from "../../models/Admissions";

function getBalance(admission) {
  let bedCharges = 0;
  let surgeryCharges = 0;
  let doctorCharges = 0;
  let packageCharges = 0;
  let supplementaryCharges = 0;
  let otherServiceCharges = 0;
  let totalCharges = 0;

  // 1. Bed Charges from bedHistory
  if (admission.bedHistory.length > 0) {
    admission.bedHistory.forEach((bedEntry, index) => {
      let startDate = new Date(bedEntry.startDate);
      let endDate = bedEntry.endDate
        ? new Date(bedEntry.endDate)
        : index === admission.bedHistory.length - 1
        ? new Date()
        : null;

      if (!endDate)
        return NextResponse.json(
          { message: "Beds' End Date not found.", success: false },
          { status: 404 }
        );

      const hoursElapsed = Math.ceil((endDate - startDate) / (1000 * 60 * 60)); // Time elapsed in hours
      bedCharges = Math.ceil(hoursElapsed / 12) * (bedEntry.bed?.price || 0); // Per 12 hours
      totalCharges += bedCharges;
    });
  }

  // 2. Surgery Charges
  if (admission.surgery.length > 0) {
    surgeryCharges = admission.surgery.reduce(
      (sum, surgery) => sum + (surgery.surgery?.price || 0),
      0
    );
    totalCharges += surgeryCharges;
  }

  // 3. Doctor Charges
  if (admission.doctor.length > 0) {
    doctorCharges = admission.doctor.reduce(
      (sum, doctor) => sum + (doctor.doctor?.charge || 0),
      0
    );
    totalCharges += doctorCharges;
  }

  // 4. Package Charges
  if (admission.package.length > 0) {
    packageCharges = admission.package.reduce(
      (sum, pkg) => sum + (pkg.package?.price || 0),
      0
    );
    totalCharges += packageCharges;
  }

  // 5. Supplementary and Other Services
  if (admission.supplementaryService.length > 0) {
    supplementaryCharges = admission.supplementaryService.reduce(
      (sum, service) => sum + (service.amount || 0),
      0
    );
    totalCharges += supplementaryCharges;
  }

  if (admission.otherServices.length > 0) {
    otherServiceCharges = admission.otherServices.reduce(
      (sum, service) => sum + (service.amount || 0),
      0
    );
    totalCharges += otherServiceCharges;
  }

  // Total Payments
  let totalPayments = 0;
  let ipdPayments = 0;
  let insurancePayments = 0;

  // 1. IPD Payments
  if (admission.ipdPayments.length > 0) {
    ipdPayments = admission.ipdPayments.reduce(
      (sum, payment) => sum + (payment.amount || 0),
      0
    );
    totalPayments += ipdPayments;
  }

  // 2. Insurance Payments
  if (admission.insuranceInfo?.payments.length > 0) {
    insurancePayments = admission.insuranceInfo.payments.reduce(
      (sum, payment) => sum + (payment.amount || 0),
      0
    );
    totalPayments += insurancePayments;
  }
  return {
    bedCharges,
    surgeryCharges,
    doctorCharges,
    packageCharges,
    supplementaryCharges,
    otherServiceCharges,
    ipdPayments,
    insurancePayments,
    totalCharges,
    totalPayments,
    balance: totalCharges - totalPayments,
  };
}

export async function GET(req) {
  await dbConnect();

  let id = req.nextUrl.searchParams.get("id");
  let isCompleted = req.nextUrl.searchParams.get("isCompleted");
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
    if (id) {
      let admission = await Admission.findById(id).populate({
        path: "patientId",
        select: "name uhid",
      });
      return NextResponse.json({ admission, success: true }, { status: 200 });
    }
    page = parseInt(page) || 1;
    const limit = 50; // Number of prescriptions per page
    const skip = (page - 1) * limit;
    let query = { dischargeDate: { $exists: true, $ne: null } };
    if (isCompleted === "1") {
      query = { ...query, isCompleted: false };
    }
    const allAdmission = await Admission.find(query)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "patientId",
        select: "name uhid",
      });
    return NextResponse.json({ allAdmission, success: true }, { status: 200 });
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
    let paymentDetails = getBalance(admission);
    console.log(paymentDetails.balance,1)
    admission.dischargeDate = new Date();
    if (paymentDetails.balance <= 0) {
      admission.isCompleted = true;
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
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
