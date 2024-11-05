import mongoose from "mongoose";

const dataEntrySchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  items: [{ name: String, price: Number }],
  createdAt: { type: Date, default: Date.now, required: true },
});

export default mongoose.models.DataEntry ||
  mongoose.model("DataEntry", dataEntrySchema);
