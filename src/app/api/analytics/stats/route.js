import { NextResponse } from "next/server";
import { eachDayOfInterval, startOfDay, endOfDay } from "date-fns";
import dbConnect from "@/app/lib/Mongodb";
import Prescription from "@/app/models/Prescriptions";
import MonthlyPrescriptionStats from "@/app/models/MonthlyPrescriptionStats";

// export async function POST(req) {
//   await dbConnect();
//   const { from, to } = await req.json();

//   const fromDate = new Date(from);
//   const toDate = new Date(to);

//   const days = eachDayOfInterval({
//     start: startOfDay(fromDate),
//     end: endOfDay(toDate),
//   });

//   const finalSummary = {
//     totalInvoices: 0,
//     subtotal: 0,
//     discount: 0,
//     total: 0,
//     paymentModes: new Map(),
//     departmentSummary: new Map(),
//   };

//   for (let date of days) {
//     const code = date.toISOString().split("T")[0];
//     const month = date.getMonth() + 1;
//     const year = date.getFullYear();

//     let start, end;

//     const isStartDay = date.toDateString() === fromDate.toDateString();
//     const isEndDay = date.toDateString() === toDate.toDateString();

//     // calculate accurate time range
//     if (isStartDay && isEndDay) {
//       start = fromDate;
//       end = toDate;
//     } else if (isStartDay) {
//       start = fromDate;
//       end = endOfDay(date);
//     } else if (isEndDay) {
//       start = startOfDay(date);
//       end = toDate;
//     } else {
//       // middle full day
//       let monthlyDoc = await MonthlyPrescriptionStats.findOne({ month, year });
//       const existingDay = monthlyDoc?.days?.find((d) => d.code === code);
//       if (existingDay) {
//         mergeIntoFinalSummary(finalSummary, existingDay);
//         continue;
//       }
//       start = startOfDay(date);
//       end = endOfDay(date);
//     }

//     // Compute fresh daily summary
//     const prescriptions = await Prescription.find({
//       createdAt: { $gte: start, $lte: end },
//     })
//       .populate("department")
//       .populate("createdBy");

//     const summary = computeDailySummary(prescriptions, date, code);
//     mergeIntoFinalSummary(finalSummary, summary);

//     // Save only if full-day case
//     if (!isStartDay && !isEndDay && prescriptions.length > 0) {
//       let monthlyDoc = await MonthlyPrescriptionStats.findOne({ month, year });
//       if (!monthlyDoc) {
//         monthlyDoc = new MonthlyPrescriptionStats({
//           month,
//           year,
//           code: `${year}-${String(month).padStart(2, "0")}`,
//           days: [],
//         });
//       }

//       monthlyDoc.days.push(summary);
//       monthlyDoc.totalInvoices += summary.totalInvoices;
//       monthlyDoc.subtotal += summary.subtotal;
//       monthlyDoc.discount += summary.discount;
//       monthlyDoc.total += summary.total;
//       mergeMonthlyWithDay(monthlyDoc, summary);
//       await monthlyDoc.save();
//     }
//   }

//   // Convert Maps to plain objects
//   finalSummary.paymentModes = Object.fromEntries(finalSummary.paymentModes);
//   finalSummary.departmentSummary = Array.from(
//     finalSummary.departmentSummary.values()
//   );

//   return NextResponse.json({ success: true, summary: finalSummary });
// }

export async function POST(req) {
  return NextResponse.json({ success: true, message: "Service Unavailable" });
  await dbConnect();
  const { from, to } = await req.json(); // Expect ISO strings

  const range = eachDayOfInterval({
    start: new Date(from),
    end: new Date(to),
  });

  const finalSummary = {
    totalInvoices: 0,
    subtotal: 0,
    discount: 0,
    total: 0,
    paymentModes: new Map(),
    departmentSummary: new Map(), // key: dept._id.toString()
  };

  for (const date of range) {
    const code = date.toISOString().split("T")[0];
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    let monthlyDoc = await MonthlyPrescriptionStats.findOne({ month, year });

    let existingDay = monthlyDoc?.days?.find((d) => d.code === code);

    let dailySummary;

    if (existingDay) {
      dailySummary = existingDay;
    } else {
      const prescriptions = await Prescription.find({
        createdAt: {
          $gte: startOfDay(date),
          $lte: endOfDay(date),
        },
      })
        .populate("department")
        .populate("createdBy");

      dailySummary = computeDailySummary(prescriptions, date, code);

      if (!monthlyDoc) {
        monthlyDoc = new MonthlyPrescriptionStats({
          month,
          year,
          code: `${year}-${String(month).padStart(2, "0")}`,
          days: [],
        });
      }

      monthlyDoc.days.push(dailySummary);
      monthlyDoc.totalInvoices += dailySummary.totalInvoices;
      monthlyDoc.subtotal += dailySummary.subtotal;
      monthlyDoc.discount += dailySummary.discount;
      monthlyDoc.total += dailySummary.total;

      // Merge department/payment data into monthly
      mergeMonthlyWithDay(monthlyDoc, dailySummary);

      await monthlyDoc.save();
    }

    // Merge into finalSummary
    finalSummary.totalInvoices += dailySummary.totalInvoices;
    finalSummary.subtotal += dailySummary.subtotal;
    finalSummary.discount += dailySummary.discount;
    finalSummary.total += dailySummary.total;

    for (let [mode, amt] of Object.entries(dailySummary.paymentModes || {})) {
      finalSummary.paymentModes.set(
        mode,
        (finalSummary.paymentModes.get(mode) || 0) + amt
      );
    }

    for (let deptData of dailySummary.departmentSummary || []) {
      const deptId = deptData.department?.toString();
      if (!finalSummary.departmentSummary.has(deptId)) {
        finalSummary.departmentSummary.set(deptId, { ...deptData });
      } else {
        const agg = finalSummary.departmentSummary.get(deptId);
        agg.totalInvoices += deptData.totalInvoices;
        agg.totalItems += deptData.totalItems;
        agg.subtotal += deptData.subtotal;
        agg.discount += deptData.discount;
        agg.total += deptData.total;

        for (let [mode, amt] of Object.entries(deptData.paymentModes || {})) {
          agg.paymentModes[mode] = (agg.paymentModes[mode] || 0) + amt;
        }
      }
    }
  }

  // Convert Maps to plain objects
  finalSummary.paymentModes = Object.fromEntries(finalSummary.paymentModes);
  finalSummary.departmentSummary = Array.from(
    finalSummary.departmentSummary.values()
  );

  return NextResponse.json({ success: true, summary: finalSummary });
}

function computeDailySummary(prescriptions, date, code) {
  const summary = {
    date,
    code,
    totalInvoices: prescriptions.length,
    subtotal: 0,
    discount: 0,
    total: 0,
    paymentModes: {},
    departmentSummary: [],
    createdBySummary: [],
  };

  const deptMap = new Map();
  const roleMap = new Map();

  for (let p of prescriptions) {
    const subtotal = p.price?.subtotal || 0;
    const discount = p.price?.discount || 0;
    const total = p.price?.total || 0;

    summary.subtotal += subtotal;
    summary.discount += discount;
    summary.total += total;

    // Payment mode
    const mode = p.paymentMode || "unknown";
    summary.paymentModes[mode] = (summary.paymentModes[mode] || 0) + total;

    // Department
    const deptId = p.department?._id?.toString();
    if (deptId) {
      if (!deptMap.has(deptId)) {
        deptMap.set(deptId, {
          department: p.department._id,
          totalInvoices: 0,
          totalItems: 0,
          subtotal: 0,
          discount: 0,
          total: 0,
          paymentModes: {},
        });
      }
      const dept = deptMap.get(deptId);
      dept.totalInvoices++;
      dept.totalItems += p.items?.length || 0;
      dept.subtotal += subtotal;
      dept.discount += discount;
      dept.total += total;
      dept.paymentModes[mode] = (dept.paymentModes[mode] || 0) + total;
    }

    // CreatedBy role
    const role = p.createdByRole || "unknown";
    const uid = p.createdBy?._id?.toString();
    const key = `${role}-${uid}`;
    if (!roleMap.has(key)) {
      roleMap.set(key, {
        user: p.createdBy?._id,
        role,
        totalInvoices: 0,
        subtotal: 0,
        discount: 0,
        total: 0,
        paymentModes: {},
      });
    }
    const userSum = roleMap.get(key);
    userSum.totalInvoices++;
    userSum.subtotal += subtotal;
    userSum.discount += discount;
    userSum.total += total;
    userSum.paymentModes[mode] = (userSum.paymentModes[mode] || 0) + total;
  }

  summary.departmentSummary = Array.from(deptMap.values());
  summary.createdBySummary = Array.from(roleMap.values());

  return summary;
}

function mergeIntoFinalSummary(finalSummary, daily) {
  finalSummary.totalInvoices += daily.totalInvoices;
  finalSummary.subtotal += daily.subtotal;
  finalSummary.discount += daily.discount;
  finalSummary.total += daily.total;

  for (let [mode, amt] of Object.entries(daily.paymentModes || {})) {
    finalSummary.paymentModes.set(
      mode,
      (finalSummary.paymentModes.get(mode) || 0) + amt
    );
  }

  for (let deptData of daily.departmentSummary || []) {
    const deptId = deptData.department?.toString();
    if (!finalSummary.departmentSummary.has(deptId)) {
      finalSummary.departmentSummary.set(deptId, { ...deptData });
    } else {
      const agg = finalSummary.departmentSummary.get(deptId);
      agg.totalInvoices += deptData.totalInvoices;
      agg.totalItems += deptData.totalItems;
      agg.subtotal += deptData.subtotal;
      agg.discount += deptData.discount;
      agg.total += deptData.total;

      for (let [mode, amt] of Object.entries(deptData.paymentModes || {})) {
        agg.paymentModes[mode] = (agg.paymentModes[mode] || 0) + amt;
      }
    }
  }
}

function mergeMonthlyWithDay(monthlyDoc, daySummary) {
  // Merge paymentModes
  for (let [mode, amt] of Object.entries(daySummary.paymentModes || {})) {
    monthlyDoc.paymentModes.set(
      mode,
      (monthlyDoc.paymentModes.get(mode) || 0) + amt
    );
  }

  const deptMap = new Map(
    (monthlyDoc.departmentSummary || []).map((d) => [
      d.department.toString(),
      d,
    ])
  );

  for (let d of daySummary.departmentSummary || []) {
    const deptId = d.department?.toString();
    if (!deptMap.has(deptId)) {
      deptMap.set(deptId, { ...d });
    } else {
      const existing = deptMap.get(deptId);
      existing.totalInvoices += d.totalInvoices;
      existing.totalItems += d.totalItems;
      existing.subtotal += d.subtotal;
      existing.discount += d.discount;
      existing.total += d.total;

      for (let [mode, amt] of Object.entries(d.paymentModes || {})) {
        existing.paymentModes[mode] = (existing.paymentModes[mode] || 0) + amt;
      }
    }
  }

  monthlyDoc.departmentSummary = Array.from(deptMap.values());
}

// let data = {
//   success: true,
//   summary: {
//     totalInvoices: 22,
//     subtotal: 8700,
//     discount: 50,
//     total: 8650,
//     paymentModes: {
//       $__parent:
//         "0{\n  date: 2024-12-31T18:30:00.000Z,\n  code: '2024-12-31',\n  totalInvoices: 0,\n  subtotal: 0,\n  discount: 0,\n  total: 0,\n  paymentModes: Map(0) {},\n  departmentSummary: [],\n  createdBySummary: [],\n  _id: new ObjectId('68553bf289c340dabefab78c')\n}{\n  date: 2025-01-01T18:30:00.000Z,\n  code: '2025-01-01',\n  totalInvoices: 0,\n  subtotal: 0,\n  discount: 0,\n  total: 0,\n  paymentModes: Map(0) {},\n  departmentSummary: [],\n  createdBySummary: [],\n  _id: new ObjectId('68553bf289c340dabefab791')\n}{\n  date: 2025-01-02T18:30:00.000Z,\n  code: '2025-01-02',\n  totalInvoices: 0,\n  subtotal: 0,\n  discount: 0,\n  total: 0,\n  paymentModes: Map(0) {},\n  departmentSummary: [],\n  createdBySummary: [],\n  _id: new ObjectId('68553bf289c340dabefab797')\n}{\n  date: 2025-01-03T18:30:00.000Z,\n  code: '2025-01-03',\n  totalInvoices: 0,\n  subtotal: 0,\n  discount: 0,\n  total: 0,\n  paymentModes: Map(0) {},\n  departmentSummary: [],\n  createdBySummary: [],\n  _id: new ObjectId('68553bf289c340dabefab79e')\n}{\n  date: 2025-01-04T18:30:00.000Z,\n  code: '2025-01-04',\n  totalInvoices: 0,\n  subtotal: 0,\n  discount: 0,\n  total: 0,\n  paymentModes: Map(0) {},\n  departmentSummary: [],\n  createdBySummary: [],\n  _id: new ObjectId('68553bf289c340dabefab7a6')\n}{\n  date: 2025-01-05T18:30:00.000Z,\n  code: '2025-01-05',\n  totalInvoices: 0,\n  subtotal: 0,\n  discount: 0,\n  total: 0,\n  paymentModes: Map(0) {},\n  departmentSummary: [],\n  createdBySummary: [],\n  _id: new ObjectId('68553bf289c340dabefab7af')\n}{\n  date: 2025-01-06T18:30:00.000Z,\n  code: '2025-01-06',\n  totalInvoices: 0,\n  subtotal: 0,\n  discount: 0,\n  total: 0,\n  paymentModes: Map(0) {},\n  departmentSummary: [],\n  createdBySummary: [],\n  _id: new ObjectId('68553bf289c340dabefab7b9')\n}",
//       $__path:
//         "0paymentModespaymentModespaymentModespaymentModespaymentModespaymentModespaymentModes",
//       $__schemaType:
//         "0[object Object][object Object][object Object][object Object][object Object][object Object][object Object]",
//       Cash: 5450,
//       UPI: 2950,
//       Card: 250,
//     },
//     departmentSummary: [
//       {
//         department: "681322601b66ba93897e3de3",
//         totalInvoices: 17,
//         totalItems: 18,
//         subtotal: 5450,
//         discount: 50,
//         total: 5400,
//         paymentModes: {
//           Cash: 4150,
//           UPI: 1000,
//           Card: 250,
//         },
//       },
//       {
//         department: "681b28bc8ebd66dc6149604b",
//         totalInvoices: 5,
//         totalItems: 5,
//         subtotal: 3250,
//         discount: 0,
//         total: 3250,
//         paymentModes: {
//           Cash: 1300,
//           UPI: 1950,
//         },
//       },
//     ],
//   },
// };
