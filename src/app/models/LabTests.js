import mongoose from "mongoose";

const labTestSchema = new mongoose.Schema({
  ltid: { type: String, required: [true, "Please provide a LTID"] },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  items: [
    {
      name: { type: String, required: true },
      range: { type: String, required: true },
      unit: { type: String, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.LabTest ||
  mongoose.model("LabTest", labTestSchema);

// export default LabTest;
