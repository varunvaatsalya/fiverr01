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
  salts: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Salt",
    required: true,
  },
  isTablets: {
    type: Boolean,
    required: true,
  },
  medicineType: {
    type: String,
  },
  packetSize: {
    strips: {
      type: Number,
      required: true,
    },
    tabletsPerStrip: {
      type: Number,
      required: true,
    },
  },
  minimumStockCount: {
    godown: {
      type: Number,
    },
    retails: {
      type: Number,
    },
  },
  rackPlace: {
    godown: {
      type: String,
    },
    retails: {
      type: String,
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
