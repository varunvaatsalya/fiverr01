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
  maximumStockCount: {
    godown: {
      type: Number,
    },
    retails: {
      type: Number,
    },
  },
  minimumHospitalStockCount: {
    godown: {
      type: Number,
    },
    retails: {
      type: Number,
    },
  },
  maximumHospitalStockCount: {
    godown: {
      type: Number,
    },
    retails: {
      type: Number,
    },
  },
  avgMonthlyBoxes: {
    type: new mongoose.Schema(
      {
        "1m": { type: Number, default: 0 },
        "2m": { type: Number, default: 0 },
        "3m": { type: Number, default: 0 },
        "6m": { type: Number, default: 0 },
        "12m": { type: Number, default: 0 },
        savedAt: { type: Date, default: Date.now },
      },
      { _id: false }
    ),
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
  latestSource: [
    {
      sourceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "latestVendors.sourceType",
      },
      sourceType: {
        type: String,
        enum: ["Vendor", "Manufacturer"],
        required: true,
      },
    },
  ],
  stockOrderInfo: {
    quantity: Number,
    orderedAt: Date,
  },
  stockHospitalOrderInfo: {
    quantity: Number,
    orderedAt: Date,
  },
  createdAt: { type: Date, default: Date.now, required: true },
});

export default mongoose.models.Medicine ||
  mongoose.model("Medicine", medicineSchema);
