import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyTokenWithLogout } from "../../utils/jwt";
import PharmacyInvoice from "../../models/PharmacyInvoice";
import { Medicine } from "@/app/models";

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

async function getAnalytics(startDate, endDate) {
  const invoicesQuery = {
    createdAt: { $gte: startDate, $lt: endDate },
    "price.total": { $exists: true, $ne: null },
  };

  const pharmacyInvoices = await PharmacyInvoice.find(invoicesQuery).select(
    "paymentMode payments inid price isDelivered createdAt returns"
  );

  const returnQuery = {
    "returns.createdAt": { $gte: startDate, $lt: endDate },
  };

  const returnInvoices = await PharmacyInvoice.find(returnQuery)
    .select("returns inid patientId createdAt")
    .populate("patientId", "name");

  let paidCount = 0,
    unpaidCount = 0,
    paidAmount = 0,
    unpaidAmount = 0,
    totalReturnInvoices = 0,
    totalReturnAmount = 0;
    
  const medicineReturnMap = new Map(); // medicine-wise
  const patientReturnMap = new Map(); // patient-wise

  for (const inv of returnInvoices) {
    let hasReturnInRange = false;
    let patientId = inv.patientId.toString();

    for (const ret of inv.returns || []) {
      if (ret.createdAt >= startDate && ret.createdAt < endDate) {
        hasReturnInRange = true;

        let returnTotal = 0;

        for (const med of ret.medicines || []) {
          const medId = med.medicineId.toString();

          for (const stock of med.returnStock || []) {
            const qty =
              (stock.quantity?.strips || 0) + (stock.quantity?.tablets || 0);
            const price = stock.price || 0;
            returnTotal += price;

            // Medicine-wise mapping
            if (!medicineReturnMap.has(medId)) {
              medicineReturnMap.set(medId, {
                medicineId: medId,
                quantity: 0,
                totalAmount: 0,
              });
            }

            const existingMed = medicineReturnMap.get(medId);
            existingMed.quantity += qty;
            existingMed.totalAmount += price;
          }
        }

        // Paid / unpaid tracking
        if (ret.isReturnAmtPaid) {
          paidCount++;
          paidAmount += returnTotal;
        } else {
          unpaidCount++;
          unpaidAmount += returnTotal;
        }
        totalReturnAmount += returnTotal;

        // Patient-wise mapping
        if (!patientReturnMap.has(patientId)) {
          patientReturnMap.set(patientId, {
            patientName: inv.patientId?.name || "Unknown",
            totalAmount: 0,
            paidAmount: 0,
            unpaidAmount: 0,
          });
        }

        const patientEntry = patientReturnMap.get(patientId);
        patientEntry.totalAmount += returnTotal;
        if (ret.isReturnAmtPaid) patientEntry.paidAmount += returnTotal;
        else patientEntry.unpaidAmount += returnTotal;
      }
    }

    // Count only if invoice has return in date range
    if (hasReturnInRange) totalReturnInvoices++;
  }

  // Final array from Map

  const medicineIds = Array.from(medicineReturnMap.keys());

  // STEP 2: Bulk fetch medicines from DB with only `_id` and `name`
  const medicines = await Medicine.find({ _id: { $in: medicineIds } })
    .select("_id name")
    .lean();

  // STEP 3: Create a map of id → name
  const medicineIdNameMap = new Map(
    medicines.map((m) => [m._id.toString(), m.name])
  );

  const medicineWiseReturn = Array.from(medicineReturnMap.entries()).map(
    ([id, data]) => ({
      name: medicineIdNameMap.get(id) || "Unknown",
      quantity: data.quantity,
      totalAmount: data.totalAmount,
    })
  );

  return {
    pharmacyInvoices,
    returnSummary: {
      totalReturnInvoices,
      paidCount,
      unpaidCount,
      paidAmount,
      unpaidAmount,
      patientWise: Array.from(patientReturnMap.values()),
      medicineWise: Array.from(medicineWiseReturn.values()),
    },
  };
}

export async function GET(req) {
  await dbConnect();

  const token = req.cookies.get("authToken");
  if (!token) {
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

    const { pharmacyInvoices, returnSummary } = await getAnalytics(
      startUTC,
      endUTC
    );

    return NextResponse.json(
      {
        pharmacyInvoices,
        returnSummary,
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
  const token = req.cookies.get("authToken");
  if (!token) {
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

    const { pharmacyInvoices, returnSummary } = await getAnalytics(start, end);

    return NextResponse.json(
      {
        pharmacyInvoices,
        returnSummary,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
