import mongoose from "mongoose";

const RoleLogoutSchema = new mongoose.Schema({
  role: { type: String, required: true, unique: true },
  lastLogoutAt: { type: Date, required: true },
});

export default mongoose.models?.RoleLogout ||
  mongoose.model("RoleLogout", RoleLogoutSchema);
