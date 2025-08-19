import mongoose from "mongoose";

const loadLogSchema = new mongoose.Schema({
  type: String,
  path: String,
  method: String,
  duration: Number,
  timestamp: Date,
});

export default mongoose.models.LoadLog ||
  mongoose.model("LoadLog", loadLogSchema);
