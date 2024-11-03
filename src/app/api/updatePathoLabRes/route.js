import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import LabTest from "../../models/LabTests";
import Prescription from "../../models/Prescriptions";
import { verifyToken } from "../../utils/jwt";

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

  const decoded = await verifyToken(token.value);
  const userRole = decoded.role;
  if (!decoded || !userRole) {
    return NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
  }
  if (userRole !== "admin" && userRole !== "pathologist") {
    return NextResponse.json(
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }

  try {
    page = parseInt(page) || 1;
    const limit = 50; // Number of prescriptions per page
    const skip = (page - 1) * limit;
    const recentCompletedTests = await Prescription.aggregate([
      { $unwind: "$tests" },
      { $match: { "tests.resultDate": { $ne: null } } },
      {
        $lookup: {
          from: "labtests",
          localField: "tests.test",
          foreignField: "_id",
          as: "testInfo",
        },
      },
      { $unwind: "$testInfo" },

      {
        $lookup: {
          from: "patients",
          localField: "patient",
          foreignField: "_id",
          as: "patientInfo",
        },
      },

      { $unwind: "$patientInfo" },

      {
        $project: {
          pid: "$pid",
          testId: "$tests._id",
          // results: "$tests.results",
          resultDate: "$tests.resultDate",
          testName: "$testInfo.name",
          patientName: "$patientInfo.name",
          patientUHID: "$patientInfo.uhid",
        },
      },

      { $sort: { resultDate: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    return NextResponse.json(
      { completedTests: recentCompletedTests, success: true },
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
