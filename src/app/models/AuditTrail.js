import mongoose from "mongoose";

const auditTrailSchema = new mongoose.Schema({
  resourceType: {
    type: String,
    required: true,
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "resourceType",
  },
  editedByRole: {
    type: String,
  },
  editedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  changes: {
    before: { type: mongoose.Schema.Types.Mixed },
    after: { type: mongoose.Schema.Types.Mixed },
  },
  remarks: { type: String }, // optional custom comment
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.AuditTrail ||
  mongoose.model("AuditTrail", auditTrailSchema);
