// models/department.js

import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
  uid: { type: String, required: [true, "Please provide a UID"] },
  name: { type: String, required: true, unique: true },
  items: [{ name: String, price: Number }], // Array of doctor IDs
  createdAt: { type: Date, default: Date.now },
});

// const Department = mongoose.model("Department", departmentSchema);
export default mongoose.models.Department ||
  mongoose.model("Department", departmentSchema);

// export default Department;
