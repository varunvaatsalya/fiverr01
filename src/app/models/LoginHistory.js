const mongoose = require("mongoose");

const loginHistorySchema = new mongoose.Schema({
  attemptedUserEmail: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: [
      "admin",
      "salesman",
      "nurse",
      "owner",
      "pathologist",
      "dispenser",
      "stockist",
    ],
    default: null,
  },
  status: {
    type: String,
    enum: ["success", "failed"],
    required: true,
  },
  reason: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },
  loginTime: {
    type: Date,
    default: Date.now,
    expires: "45d", // auto-delete after 30 days
  },
});

export default mongoose.models.LoginHistory ||
  mongoose.model("LoginHistory", loginHistorySchema);
