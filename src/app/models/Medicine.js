const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  manufacturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Manufacturer",
    required: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  medicalRepresentator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MedicalRepresentator",
    required: true,
  },
  salts: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Salt",
    required: true,
  },
  packetSize: {
    strips: {
      type: Number,   // Strips per Box
      required: true,
    },
    tabletsPerStrip: {
      type: Number,
      required: true,
    },
  },
  currentPurchasePrice: {
    type: Number,
  },
  currentSellingPrice: {
    type: Number,
  },
  createdAt: { type: Date, default: Date.now, required: true },
});

export default mongoose.models.Medicine ||
  mongoose.model("Medicine", medicineSchema);
