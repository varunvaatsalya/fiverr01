// models/Admin.js
import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  name: {
    type: String,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
