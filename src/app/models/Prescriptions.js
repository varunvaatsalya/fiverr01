import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
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
  pid: {
    type: String,
    required: [true, 'Please provide a UID'],
  },
  createdAt: { type: Date, default: Date.now, required: true },
});

export default mongoose.models.Prescription ||
  mongoose.model("Prescription", prescriptionSchema);
