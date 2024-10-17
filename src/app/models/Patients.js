
import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  uhid: { type: String, required: [true, "Please provide a UHID"] },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  mobileNumber: { type: Number, required: true },
  aadharNumber: { type: Number },
  address: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});


export default mongoose.models.Patient ||
  mongoose.model("Patient", patientSchema);

// export default Patient;
