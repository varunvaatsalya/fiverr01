import mongoose from "mongoose";

// Daily Summary Schema
const dailyRecordSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  code: { type: String, required: true }, // e.g. '2025-06-01'
  totalInvoices: { type: Number, default: 0 },
  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },

  paymentModes: {
    type: Map,
    of: Number, // { "cash": 1000, "card": 500, "upi": 300 }
    default: {},
  },

  departmentSummary: [
    {
      department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
      },
      totalInvoices: { type: Number, default: 0 },
      totalItems: { type: Number, default: 0 },
      subtotal: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      paymentModes: {
        type: Map,
        of: Number,
        default: {},
      },
    },
  ],

  createdBySummary: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      role: { type: String, enum: ["admin", "salesman", "nurse"] },
      totalInvoices: { type: Number, default: 0 },
      subtotal: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      paymentModes: {
        type: Map,
        of: Number,
        default: {},
      },
    },
  ],
});

// Monthly Summary Schema
const monthlyPrescriptionStatsSchema = new mongoose.Schema({
  month: { type: Number, required: true }, // 1 to 12
  year: { type: Number, required: true },
  code: { type: String, required: true }, // e.g. '2025-06'
  days: [dailyRecordSchema],

  totalInvoices: { type: Number, default: 0 },
  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },

  paymentModes: {
    type: Map,
    of: Number,
    default: {},
  },

  departmentSummary: [
    {
      department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
      },
      totalInvoices: { type: Number, default: 0 },
      totalItems: { type: Number, default: 0 },
      subtotal: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      paymentModes: {
        type: Map,
        of: Number,
        default: {},
      },
    },
  ],
});

monthlyPrescriptionStatsSchema.index({ month: 1, year: 1 }, { unique: true });

export default mongoose.models.MonthlyPrescriptionStats ||
  mongoose.model("MonthlyPrescriptionStats", monthlyPrescriptionStatsSchema);


//   // controllers/prescriptionSummaryController.js
// import Prescription from "../models/Prescription.js";
// import MonthlyPrescriptionStats from "../models/MonthlyPrescriptionStats.js";
// import mongoose from "mongoose";
// import moment from "moment";

// export const getPrescriptionSummary = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;

//     const start = startDate ? moment(startDate).startOf("day") : moment().startOf("day");
//     const end = endDate ? moment(endDate).endOf("day") : moment().endOf("day");

//     const isSingleMonth =
//       start.month() === end.month() && start.year() === end.year();

//     // Format month-year key
//     const month = start.month() + 1;
//     const year = start.year();
//     const code = `${year}-${month.toString().padStart(2, "0")}`;

//     let statsDoc = await MonthlyPrescriptionStats.findOne({ month, year });

//     if (statsDoc && isSingleMonth) {
//       // ✅ If already exists and within same month
//       const filteredDays = statsDoc.days.filter((d) => {
//         const day = moment(d.date);
//         return day.isBetween(start, end, null, "[]");
//       });

//       const finalResult = aggregateFromSavedData(filteredDays, statsDoc.departmentSummary, statsDoc.paymentModes);
//       return res.json({ source: "cache", ...finalResult });
//     }

//     // ❌ Not found OR cross-month → aggregate from Prescription
//     const prescriptions = await Prescription.find({
//       createdAt: {
//         $gte: start.toDate(),
//         $lte: end.toDate(),
//       },
//     })
//       .populate("department")
//       .populate("createdBy");

//     // ✅ Aggregate the raw prescriptions
//     const { fullMonthSummary, filteredSummary } = buildStats(prescriptions, start, end);

//     // Save monthly doc if not exists
//     if (!statsDoc) {
//       await MonthlyPrescriptionStats.create({
//         month,
//         year,
//         code,
//         ...fullMonthSummary,
//       });
//     }

//     return res.json({ source: "calculated", ...filteredSummary });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server Error" });
//   }
// };


// const buildStats = (prescriptions, start, end) => {
//   const dayMap = new Map();
//   const deptMap = new Map();
//   const paymentMap = new Map();

//   prescriptions.forEach((pres) => {
//     const createdAt = moment(pres.createdAt).startOf("day");
//     const dateKey = createdAt.format("YYYY-MM-DD");

//     // ✅ Init daily entry
//     if (!dayMap.has(dateKey)) {
//       dayMap.set(dateKey, {
//         date: createdAt.toDate(),
//         code: dateKey,
//         totalInvoices: 0,
//         subtotal: 0,
//         discount: 0,
//         total: 0,
//         paymentModes: new Map(),
//         departmentSummary: [],
//         createdBySummary: [],
//       });
//     }

//     const day = dayMap.get(dateKey);
//     day.totalInvoices += 1;
//     day.subtotal += pres.price.subtotal;
//     day.discount += pres.price.discount;
//     day.total += pres.price.total;

//     // Payment mode update
//     const pm = pres.paymentMode;
//     day.paymentModes.set(pm, (day.paymentModes.get(pm) || 0) + pres.price.total);
//     paymentMap.set(pm, (paymentMap.get(pm) || 0) + pres.price.total);

//     // Department Summary
//     const deptId = pres.department._id.toString();
//     const deptKey = `${dateKey}_${deptId}`;
//     let deptEntry = day.departmentSummary.find((d) => d.department.toString() === deptId);
//     if (!deptEntry) {
//       deptEntry = {
//         department: pres.department._id,
//         totalInvoices: 0,
//         totalItems: 0,
//         subtotal: 0,
//         discount: 0,
//         total: 0,
//         paymentModes: new Map(),
//       };
//       day.departmentSummary.push(deptEntry);
//     }

//     deptEntry.totalInvoices += 1;
//     deptEntry.totalItems += pres.items.length;
//     deptEntry.subtotal += pres.price.subtotal;
//     deptEntry.discount += pres.price.discount;
//     deptEntry.total += pres.price.total;
//     deptEntry.paymentModes.set(
//       pm,
//       (deptEntry.paymentModes.get(pm) || 0) + pres.price.total
//     );

//     // User-wise (CreatedBy)
//     let userEntry = day.createdBySummary.find((u) => u.user.toString() === pres.createdBy._id.toString());
//     if (!userEntry) {
//       userEntry = {
//         user: pres.createdBy._id,
//         role: pres.createdByRole,
//         totalInvoices: 0,
//         subtotal: 0,
//         discount: 0,
//         total: 0,
//         paymentModes: new Map(),
//       };
//       day.createdBySummary.push(userEntry);
//     }
//     userEntry.totalInvoices += 1;
//     userEntry.subtotal += pres.price.subtotal;
//     userEntry.discount += pres.price.discount;
//     userEntry.total += pres.price.total;
//     userEntry.paymentModes.set(pm, (userEntry.paymentModes.get(pm) || 0) + pres.price.total);
//   });

//   const days = Array.from(dayMap.values());
//   const departmentSummary = [];

//   // Aggregate departmentSummary for month
//   days.forEach((day) => {
//     day.departmentSummary.forEach((dept) => {
//       const id = dept.department.toString();
//       let entry = deptMap.get(id);
//       if (!entry) {
//         entry = {
//           department: dept.department,
//           totalInvoices: 0,
//           totalItems: 0,
//           subtotal: 0,
//           discount: 0,
//           total: 0,
//           paymentModes: new Map(),
//         };
//         deptMap.set(id, entry);
//       }

//       entry.totalInvoices += dept.totalInvoices;
//       entry.totalItems += dept.totalItems;
//       entry.subtotal += dept.subtotal;
//       entry.discount += dept.discount;
//       entry.total += dept.total;

//       for (let [mode, amt] of dept.paymentModes.entries()) {
//         entry.paymentModes.set(mode, (entry.paymentModes.get(mode) || 0) + amt);
//       }
//     });
//   });

//   return {
//     fullMonthSummary: {
//       days,
//       totalInvoices: days.reduce((sum, d) => sum + d.totalInvoices, 0),
//       subtotal: days.reduce((sum, d) => sum + d.subtotal, 0),
//       discount: days.reduce((sum, d) => sum + d.discount, 0),
//       total: days.reduce((sum, d) => sum + d.total, 0),
//       paymentModes: Object.fromEntries(paymentMap.entries()),
//       departmentSummary: Array.from(deptMap.values()).map((d) => ({
//         ...d,
//         paymentModes: Object.fromEntries(d.paymentModes),
//       })),
//     },
//     filteredSummary: {
//       days,
//       totalInvoices: days.reduce((sum, d) => sum + d.totalInvoices, 0),
//       subtotal: days.reduce((sum, d) => sum + d.subtotal, 0),
//       discount: days.reduce((sum, d) => sum + d.discount, 0),
//       total: days.reduce((sum, d) => sum + d.total, 0),
//       paymentModes: Object.fromEntries(paymentMap.entries()),
//       departmentSummary: Array.from(deptMap.values()).map((d) => ({
//         ...d,
//         paymentModes: Object.fromEntries(d.paymentModes),
//       })),
//     },
//   };
// };

// // If using saved days only
// const aggregateFromSavedData = (days, deptSummary, paymentModes) => {
//   return {
//     days,
//     totalInvoices: days.reduce((sum, d) => sum + d.totalInvoices, 0),
//     subtotal: days.reduce((sum, d) => sum + d.subtotal, 0),
//     discount: days.reduce((sum, d) => sum + d.discount, 0),
//     total: days.reduce((sum, d) => sum + d.total, 0),
//     paymentModes: Object.fromEntries(paymentModes),
//     departmentSummary: deptSummary,
//   };
// };
