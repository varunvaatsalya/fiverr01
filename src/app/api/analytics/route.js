import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyTokenWithLogout } from "../../utils/jwt";
import Doctor from "../../models/Doctors";
import Department from "../../models/Departments";
import Prescription from "../../models/Prescriptions";
import { Expense } from "../../models/Expenses";
import { LabTest } from "@/app/models";

function getDates() {
  const now = new Date();
  const startIST = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0
  );

  const endIST = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );

  const startUTC = new Date(startIST.getTime());
  const endUTC = new Date(endIST.getTime());
  return { startUTC, endUTC };
}

export async function GET(req) {
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
  if (userRole !== "admin" && userRole !== "owner") {
    return NextResponse.json(
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }

  try {
    let { startUTC, endUTC } = getDates();

    const expenses = await Expense.find({
      createdAt: {
        $gte: startUTC,
        $lt: endUTC,
      },
    }).select("name amount");

    const prescriptions = await Prescription.find({
      createdAt: {
        $gte: startUTC,
        $lt: endUTC, // Until the start of tomorrow
      },
    })
      .select("-patient -tests")
      .populate({
        path: "doctor",
        select: "name specialty",
      })
      .populate({
        path: "department",
        select: "name",
      });

    const doctors = await Doctor.find({}, "_id name department").exec();
    const departments = await Department.find({}, "_id name").exec();

    return NextResponse.json(
      {
        startDate: startUTC,
        endDate: endUTC,
        prescriptions,
        expenses,
        departments,
        doctors,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  await dbConnect();

  let externalTest = req.nextUrl.searchParams.get("externalTest");

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
  if (userRole !== "admin" && userRole !== "owner" && userRole !== "salesman") {
    return NextResponse.json(
      { message: "Access denied. Admins only.", success: false },
      { status: 403 }
    );
  }
  // const { startDate, startTime, endDate, endTime } = await req.json();
  const { startDateTime, endDateTime } = await req.json();

  try {
    let { endUTC } = getDates();
    const now = new Date();
    const firstDateIST = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0
    );

    function getUTCDateTime(dateTime) {
      return new Date(dateTime);
    }

    let start = startDateTime ? getUTCDateTime(startDateTime) : firstDateIST;

    let end = endDateTime ? getUTCDateTime(endDateTime) : endUTC;

    let dateQuery = {
      createdAt: {
        $gte: start,
        $lte: end,
      },
    };

    if (externalTest === "1") {
      // Step 1: Get all external tests
      const externalTests = await LabTest.find(
        { isExternalReport: true },
        "_id name price"
      ).lean();
      const externalTestMap = new Map();
      const externalTestIds = [];

      externalTests.forEach((test) => {
        externalTestMap.set(test._id.toString(), test);
        externalTestIds.push(test._id);
      });

      const prescriptions = await Prescription.find({
        createdAt: dateQuery.createdAt,
        "tests.test": { $in: externalTestIds },
        "tests.isCompleted": true,
      })
        .select("tests")
        .lean();

      let totalPrescriptions = new Set();
      let totalTests = 0;
      let totalAmount = 0;
      const testStats = new Map();

      for (const pres of prescriptions) {
        let hasCounted = false;
        for (const t of pres.tests) {
          const testId = t.test?.toString();
          if (!testId || !externalTestMap.has(testId)) continue;

          if (!hasCounted) {
            totalPrescriptions.add(pres._id.toString());
            hasCounted = true;
          }

          totalTests += 1;
          const price = externalTestMap.get(testId).price;

          if (!testStats.has(testId)) {
            testStats.set(testId, {
              name: externalTestMap.get(testId).name,
              price,
              count: 1,
              totalAmount: price,
            });
          } else {
            const stat = testStats.get(testId);
            stat.count += 1;
            stat.totalAmount += price;
          }

          totalAmount += price;
        }
      }

      const testWise = Array.from(testStats.entries()).map(
        ([testId, stat]) => ({
          _id: testId,
          ...stat,
        })
      );


      return NextResponse.json(
        {
          totalPrescriptions: totalPrescriptions.size,
          count: totalTests,
          totalAmount,
          testWise,
          success: true,
        },
        { status: 200 }
      );
    }

    const prescriptions = await Prescription.find(dateQuery)
      .select("-patient -tests")
      .populate({
        path: "doctor",
        select: "name specialty",
      })
      .populate({
        path: "department",
        select: "name",
      });

    const expenses = await Expense.find(dateQuery).select("name amount");

    // Send response with UID
    return NextResponse.json(
      {
        startDate: start,
        endDate: end,
        prescriptions,
        expenses,
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
