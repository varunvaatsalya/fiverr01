const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  date: String, // e.g., "241107" for 7th Nov 2024
  prescriptionCounter: { type: Number, default: 1 },
  patientCounter: { type: Number, default: 1 },
  reportCounter: { type: Number, default: 1 },
  ipdCounter: { type: Number, default: 1 },
  pharmacyInvoiceCounter: { type: Number, default: 1 },
});

export default mongoose.models.Counter ||
  mongoose.model("Counter", counterSchema);