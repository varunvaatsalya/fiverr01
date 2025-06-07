import mongoose from "mongoose";

const nurseList = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.NurseList ||
  mongoose.model("NurseList", nurseList);
