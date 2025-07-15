import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  uhid: { type: String, required: [true, "Please provide a UHID"] },
  name: { type: String, required: true },
  fathersName: { type: String },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  mobileNumber: { type: Number, required: true },
  aadharNumber: { type: Number },
  address: { type: String, required: true },
  updates: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuditTrail",
    },
  ],
  createdByRole: {
    type: String,
    enum: ["admin", "salesman", "nurse", "dispenser"],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Patient ||
  mongoose.model("Patient", patientSchema);

// export default Patient;
