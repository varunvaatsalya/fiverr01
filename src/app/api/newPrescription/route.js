import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import Patient from "../../models/Patients";
import Doctor from "../../models/Doctors";
import Department from "../../models/Departments";
import Prescription from "../../models/Prescriptions";
import LabTest from "../../models/LabTests";
import { verifyToken } from "../../utils/jwt";
import { generateUniqueId } from "../../utils/counter";
import LabTests from "../../models/LabTests";
import Admission from "../../models/Admissions";

async function generateUID() {
  const prefix = "PR";
  // const timestamp = Math.floor(Date.now() / 1000).toString(); // Current timestamp in seconds
  const uniqueDigit = await generateUniqueId("prescription");
  const uniqueID = `${prefix}${uniqueDigit}`;
  return uniqueID;
}

export async function GET(req) {
  await dbConnect();
  const patient = req.nextUrl.searchParams.get("patient");
  let page = req.nextUrl.searchParams.get("page");
  let dept = req.nextUrl.searchParams.get("dept");
  const componentDetails = req.nextUrl.searchParams.get("componentDetails");

  const token = req.cookies.get("authToken");
  if (!token) {
    console.log("Token not found. Redirecting to login.");
    return NextResponse.json(
      { message: "Access denied. No token provided.", success: false },
      { status: 401 }
    );
  }

  const decoded = await verifyToken(token.value);
  let userRole = decoded.role;
  let userEditPermission = decoded.editPermission;
  if (!decoded || !userRole) {
    return NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
  }

  try {
    // const query = patient ? { patient } : {};

    if (patient) {
      const prescriptions = await Prescription.find({ patient })
        .sort({ _id: -1 })
        .populate({
          path: "doctor",
          select: "name",
        })
        .populate({
          path: "department",
          select: "name",
        })
        .select("-patient") // Exclude the patient details
        .exec();
      return NextResponse.json(
        { prescriptions, success: true },
        { status: 200 }
      );
    } else if (componentDetails == "1") {
      // const prescriptions = await Prescription.find({ patient });
      const patients = await Patient.find({}, "_id name uhid")
        .sort({ _id: -1 })
        .exec();

      // Fetch all doctors with only _id, name, and associated department ID
      const doctors = await Doctor.find({}, "_id name department").exec();

      // Fetch all departments with _id, name, and items with prices
      const departments = await Department.find({}, "_id name items").exec();

      const pathologyLabTest = await LabTests.find({}, "_id name price").sort({
        _id: -1,
      });

      departments.forEach((department) => {
        if (department.name === "pathology") {
          department.items = pathologyLabTest; // Replace items with pathologyLabTest
        }
      });

      return NextResponse.json(
        {
          patients,
          doctors,
          departments,
          success: true,
        },
        { status: 200 }
      );
    }

    page = parseInt(page) || 1;
    const limit = 50; // Number of prescriptions per page
    const skip = (page - 1) * limit;
    let query = {};
    if (dept == "pathology") {
      const pathologyDept = await Department.findOne({
        name: "pathology",
      }).select("_id");
      query = { department: pathologyDept._id };
      userRole = "none";
      userEditPermission = false;
    }

    const allPrescription = await Prescription.find(query)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "patient", // Populate the department field
        select: "name uhid address age gender mobileNumber",
      })
      .populate({
        path: "doctor", // Populate the department field
        select: "name specialty",
      })
      .populate({
        path: "tests.test",
        select: "name",
      })
      .populate({
        path: "department", // Populate the department field
        select: "name",
      })
      .populate({
        path: "createdBy",
        select: "name email",
      })
      .select("-tests.results");

    const totalPrescriptions = await Prescription.countDocuments(query);

    return NextResponse.json(
      {
        allPrescription,
        totalPages: Math.ceil(totalPrescriptions / limit),
        userRole,
        userEditPermission,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

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

  const decoded = await verifyToken(token.value);
  const userRole = decoded.role;
  const userId = decoded._id;
  if (!decoded || !userRole) {
    return NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
  }
  if (userRole !== "admin" && userRole !== "salesman") {
    return NextResponse.json(
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }
  const { patient, items, doctor, ipdAmount, department, paymentMode } =
    await req.json();

  try {
    const pid = await generateUID();

    let departmentchk = await Department.findById(department);
    let filteredTests = [];
    if (departmentchk.name == "pathology") {
      const tests = await Promise.all(
        items.map(async (item) => {
          const labTest = await LabTest.findOne({ name: item.name });
          if (labTest) {
            return {
              test: labTest._id,
              results: [],
              isCompleted: false,
            };
          }
          return null;
        })
      );

      // Remove null values (items not found in LabTest)
      filteredTests = tests.filter((test) => test !== null);
    }

    if (ipdAmount && ipdAmount.name && ipdAmount.amount) {
      const admission = await Admission.findOne({
        patientId: patient,
        isCompleted: false,
      });
      if (!admission) {
        return NextResponse.json(
          {
            success: false,
            message: "No active admission found for this patient.",
          },
          { status: 404 }
        );
      }
      items.push({ name: ipdAmount.name, price: ipdAmount.amount });
      admission.ipdPayments.push({
        name: ipdAmount.name,
        amount: ipdAmount.amount,
        date: Date.now(),
      });
      await admission.save();
    }

    if (paymentMode === "Insurence") {
      const admission = await Admission.findOne({
        patientId: patient,
        isCompleted: false,
      });
      if (!admission) {
        return NextResponse.json(
          {
            success: false,
            message: "No active admission found for this patient.",
          },
          { status: 404 }
        );
      }
      if (!admission.insuranceInfo || !admission.insuranceInfo.providerName) {
        return NextResponse.json(
          {
            success: false,
            message: "This Patient is not registered for the Insurence",
          },
          { status: 400 }
        );
      }
      items.forEach((item) => {
        admission.supplementaryService.push({
          name: item.name,
          amount: item.price,
          date: new Date(),
        });
      });
      await admission.save();
    }

    // // Create new user
    const newPrescription = new Prescription({
      patient,
      items,
      doctor,
      department,
      pid,
      paymentMode,
      tests: filteredTests,
      createdBy: userRole === "admin" || !userId ? null : userId,
      createdByRole: userRole,
    });

    // // Save user to the database
    await newPrescription.save();

    const updatedNewPrescription = await Prescription.findById(
      newPrescription._id
    )
      .populate({
        path: "patient",
        select: "name uhid address age gender mobileNumber",
      })
      .populate({
        path: "doctor",
        select: "name specialty",
      })
      .populate({
        path: "department",
        select: "name",
      })
      .populate({
        path: "createdBy",
        select: "name email",
      });

    // Send response with UID
    return NextResponse.json(
      {
        newPrescription: updatedNewPrescription,
        success: true,
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

export async function PUT(req) {
  await dbConnect();

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
  const userEditPermission = decoded.editPermission;
  if (!decoded || !userRole) {
    return NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
  }
  if (userRole !== "admin" && userRole !== "salesman" && userEditPermission) {
    return NextResponse.json(
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }

  const { _id, patient, department, doctor, items, paymentMode } =
    await req.json();

  try {
    // Check if patient exists
    const existingPrescription = await Prescription.findById(_id);
    if (!existingPrescription) {
      return NextResponse.json(
        { message: "Prescription not found", success: false },
        { status: 404 }
      );
    }

    // Update patient details
    existingPrescription.patient = patient;
    existingPrescription.department = department;
    existingPrescription.doctor = doctor;
    existingPrescription.items = items;
    existingPrescription.paymentMode = paymentMode;

    // Save updated patient to the database
    await existingPrescription.save();

    const updatedPrescription = await Prescription.findById(
      existingPrescription._id
    )
      .populate({
        path: "patient",
        select: "name uhid address age gender mobileNumber",
      })
      .populate({
        path: "doctor",
        select: "name specialty",
      })
      .populate({
        path: "department",
        select: "name",
      }).populate({
        path: "createdBy",
        select: "name email",
      });

    // Send response with updated patient details
    return NextResponse.json(
      { prescription: updatedPrescription, success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during update:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
