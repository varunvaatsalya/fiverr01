import mongoose from "mongoose";

const pharmacyExpressSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  medicines: [
    {
      medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medicine",
        required: true,
      },
      quantity: {
        strips: { type: Number, default: 0 },
        tablets: { type: Number, default: 0 },
        normalQuantity: { type: Number, default: 0 },
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.PharmacyExpress ||
  mongoose.model("PharmacyExpress", pharmacyExpressSchema);
