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
  let patient = req.nextUrl.searchParams.get("patient");

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
    if (id) {
      let bed = await Bed.findById(id)
        .populate({ path: "ward", select: "name" })
        .populate({ path: "occupancy.patientId", select: "uhid name" })
        .populate({ path: "occupancy.admissionId" })
        .exec();

      let patientsList = [];
      if (!bed.isOccupied) {
        patientsList = await Patient.find({}, "_id name uhid")
          .sort({ _id: -1 })
          .limit(200)
          .exec();
      }

      return NextResponse.json(
        { bed, patientsList, success: true },
        { status: 200 }
      );
    }
    if (patient) {
      const bedWithPatient = await Bed.findOne({
        "occupancy.patientId": patient,
        isOccupied: true,
      })
        .populate({
          path: "ward",
          select: "name",
        })
        .populate({ path: "occupancy.patientId", select: "uhid name" })
        .exec();
      return NextResponse.json(
        { bedWithPatient, success: true },
        { status: 201 }
      );
    }

    let doctors = await Doctor.find({}, "name id charge").exec();
    let surgerys = await Surgery.find({}, "name id price").exec();
    let packages = await Package.find({}, "name id price").exec();

    return NextResponse.json(
      { doctors, surgerys, packages, success: true },
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
  if (!decoded || !userRole) {
    return NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
  }
  const { patientId, newBedId, reason } = await req.json();

  try {
    // Find if the patient is currently occupying a bed
    const currentBed = await Bed.findOne({ "occupancy.patientId": patientId });

    if (currentBed) {
      // Case 1: Patient already has an assigned bed
      const admissionId = currentBed.occupancy.admissionId;

      if (!admissionId) {
        throw new Error("Admission ID not found in current bed's occupancy.");
      }

      // Update the admission record
      const admission = await Admission.findById(admissionId);
      if (!admission) {
        throw new Error("Admission not found for the patient.");
      }
      if (currentBed._id == newBedId) {
        return NextResponse.json(
          { message: "Allocation bed & current bed is same", success: false },
          { status: 400 }
        );
      }

      // Add the current bed to bedHistory
      // admission.bedHistory.push({
      //   bed: currentBed._id,
      //   startDate: admission.currentBed.startDate,
      //   endDate: new Date(), // Mark end date
      // });

      const lastHistory = admission.bedHistory[admission.bedHistory.length - 1];
      if (
        lastHistory &&
        lastHistory.bed.toString() === currentBed._id.toString()
      ) {
        // Update endDate for the last history entry
        lastHistory.endDate = new Date();
      } else {
        // Push a new entry if not already present
        admission.bedHistory.push({
          bed: currentBed._id,
          startDate: admission.currentBed.startDate,
          endDate: new Date(),
        });
      }
      admission.bedHistory.push({
        bed: newBedId,
        startDate: new Date(),
      });

      // Update currentBed in admission
      admission.currentBed = {
        bed: newBedId,
        startDate: new Date(), // New start date
      };
      await admission.save();

      // Free up the current bed
      await Bed.findByIdAndUpdate(currentBed._id, {
        isOccupied: false,
        occupancy: {
          patientId: null,
          admissionId: null,
          startDate: null,
        },
      });

      // Mark the new bed as occupied
      let updatedBed = await Bed.findByIdAndUpdate(
        newBedId,
        {
          isOccupied: true,
          occupancy: {
            patientId,
            admissionId,
            startDate: new Date(),
          },
        },
        { new: true }
      )
        .populate({ path: "ward", select: "name" })
        .populate({ path: "occupancy.patientId", select: "uhid name" })
        .populate({ path: "occupancy.admissionId" })
        .exec();

      if (id == "1") {
        return NextResponse.json(
          {
            newBedId:updatedBed._id,
            message: "Bed updated for the patient.",
            success: true,
          },
          { status: 201 }
        );
      }
      return NextResponse.json(
        { updatedBed, message: "Bed updated for the patient.", success: true },
        { status: 201 }
      );
    } else {
      // Case 2: Patient does not have an assigned bed - New Admission
      const newAdmission = await Admission.create({
        patientId,
        reason,
        adid: "12345",
        currentBed: {
          bed: newBedId,
          startDate: new Date(),
        },
        bedHistory: [
          {
            bed: newBedId,
            startDate: new Date(),
          },
        ],
        admissionDate: new Date(),
      });

      // Mark the new bed as occupied
      let updatedBed = await Bed.findByIdAndUpdate(
        newBedId,
        {
          isOccupied: true,
          occupancy: {
            patientId,
            admissionId: newAdmission._id,
            startDate: new Date(),
          },
        },
        { new: true }
      )
        .populate({ path: "ward", select: "name" })
        .populate({ path: "occupancy.patientId", select: "uhid name" })
        .populate({ path: "occupancy.admissionId" })
        .exec();

      return NextResponse.json(
        {
          updatedBed,
          message: "New admission created for the patient.",
          success: true,
        },
        { status: 201 }
      );
    }

    // return NextResponse.json({ wardbed, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
