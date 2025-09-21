import mongoose from "mongoose";

const unitOptionSchema = new mongoose.Schema({
  level0: [{ type: String }], // e.g. ["tablet", "ml", "capsule"]
  level1: [{ type: String }], // e.g. ["strip", "pack"]
  level2: [{ type: String }], // e.g. ["box", "carton"]
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.UnitOptions ||
  mongoose.model("UnitOptions", unitOptionSchema);
