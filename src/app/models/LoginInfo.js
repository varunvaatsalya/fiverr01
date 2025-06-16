const mongoose = require("mongoose");

const roleLoginSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    unique: true,
    enum: [
      "admin",
      "salesman",
      "nurse",
      "owner",
      "pathologist",
      "dispenser",
      "stockist",
    ],
  },
  lastUserEmail: { type: String, required: true }, // Last user who logged in
  deviceType: { type: String, required: true },
  ipAddress: { type: String, required: true },
  userAgent: { type: String },
  lastLogin: { type: Date, default: Date.now },
});

// const RoleLogin = mongoose.model("RoleLogin", roleLoginSchema);

export default mongoose.models.LoginInfo ||
  mongoose.model("LoginInfo", roleLoginSchema);
