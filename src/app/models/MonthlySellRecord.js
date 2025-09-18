import mongoose from "mongoose";

const monthlySellRecordSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  month: { type: Number, required: true }, // 1 - 12
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
    required: true,
  },
  totalInvoices: { type: Number, default: 0 }, // sold + returned
  totalSoldTablets: { type: Number, default: 0 }, // sold - returned
  totalRevenue: { type: Number, default: 0 }, // in Rs
  lastUpdatedAt: { type: Date, default: Date.now }, // month incomplete updates
});

monthlySellRecordSchema.index(
  { medicineId: 1, year: 1, month: 1 },
  { unique: true }
);

export default mongoose.models.MonthlySellRecord ||
  mongoose.model("MonthlySellRecord", monthlySellRecordSchema);
