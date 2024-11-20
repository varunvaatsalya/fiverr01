import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyToken } from "../../utils/jwt";
import { Bed } from "../../models/WardsBeds";
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
  let paymentSummery = req.nextUrl.searchParams.get("paymentSummery");
  let discharge = req.nextUrl.searchParams.get("discharge");

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
    if (paymentSummery == "1") {
      const admission = await Admission.findById(id)
        .populate("bedHistory.bed", "price")
        .populate("doctor.doctor", "charge")
        .populate("surgery.surgery", "price")
        .populate("package.package", "price");

      if (!admission) {
        return NextResponse.json(
          { message: "Admission not found.", success: false },
          { status: 404 }
        );
      }
      let paymentDetails = getBalance(admission);

      return NextResponse.json(
        {
          paymentDetails,
          success: true,
        },
        { status: 200 }
      );
    }
    if (discharge == "1") {
      const admission = await Admission.findById(id)
        .populate("bedHistory.bed", "price")
        .populate("doctor.doctor", "charge")
        .populate("surgery.surgery", "price")
        .populate("package.package", "price");

      if (!admission) {
        return NextResponse.json(
          { message: "Admission not found.", success: false },
          { status: 404 }
        );
      }
      if (admission.dischargeDate || admission.isCompleted) {
        return NextResponse.json(
          {
            message: "This patient is already discharged.",
            success: false,
          },
          { status: 401 }
        );
      }

      let paymentDetails = getBalance(admission);
      if (!admission.insuranceInfo?.providerName && paymentDetails.balance>0) {
        return NextResponse.json(
          {
            message: "Dues not cleared.",
            success: false,
          },
          { status: 401 }
        );
      }
      console.log(admission)

      const lastHistory = admission.bedHistory[admission.bedHistory.length - 1];
      if (
        lastHistory &&
        lastHistory.bed.toString() === admission.currentBed.bed.toString()
      ) {
        // Update endDate for the last history entry
        lastHistory.endDate = new Date();
      } else {
        // Push a new entry if not already present
        admission.bedHistory.push({
          bed: admission.currentBed.bed,
          startDate: admission.currentBed.startDate,
          endDate: new Date(),
        });
      }

      await Bed.findByIdAndUpdate(admission.currentBed.bed, {
        isOccupied: false,
        occupancy: {
          patientId: null,
          admissionId: null,
          startDate: null,
        },
      });
      
      // Update currentBed in admission
      admission.currentBed = null;
      admission.dischargeDate = new Date();
      if(paymentDetails.balance<=0){
        admission.isCompleted=true
      }
      await admission.save();      

      return NextResponse.json(
        { message: "Bed updated for the patient.", success: true },
        { status: 201 }
      );

    }
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
