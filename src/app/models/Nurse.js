// models/Nurse.js
import mongoose from "mongoose";

const NurseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    maxlength: [60, "Name cannot be more than 60 characters"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: { type: String, default: "nurse" },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Nurse ||
  mongoose.model("Nurse", NurseSchema);
