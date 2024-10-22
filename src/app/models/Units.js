import mongoose from "mongoose";

const unitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Unit || mongoose.model("Unit", unitSchema);

// export default Unit;
