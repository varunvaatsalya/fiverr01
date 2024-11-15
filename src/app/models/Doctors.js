// models/doctor.js

import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  drid: { type: String, required: [true, "Please provide a DRID"] },
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/],
  },
  charge: { type: Number },
  specialty: { type: String, required: true },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  }, // Reference to Department
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);
