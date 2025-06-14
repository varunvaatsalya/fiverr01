const mongoose = require("mongoose");

const retailStockSchema = new mongoose.Schema(
  {
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
    },
    stocks: [
      {
        batchName: {
          type: String,
          default: "N/A",
          required: true,
        },
        expiryDate: {
          type: Date,
          required: true,
        },
        packetSize: {
          strips: {
            type: Number,
          },
          tabletsPerStrip: {
            type: Number,
          },
        },
        quantity: {
          boxes: {
            type: Number,
            required: true,
          },
          extra: {
            type: Number,
            default: 0,
          }, // extra -> strips / qty
          tablets: {
            type: Number,
            default: 0,
          },
          totalStrips: {
            type: Number,
            required: true,
          },
        },
        purchasePrice: {
          type: Number,
          required: true,
        },
        sellingPrice: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// export default mongoose.models.RetailStock ||
//   mongoose.model("RetailStock", retailStockSchema);

const RetailStock =
  mongoose.models.RetailStock || mongoose.model("RetailStock", retailStockSchema);

const HospitalRetailStock =
  mongoose.models.HospitalRetailStock ||
  mongoose.model("HospitalRetailStock", retailStockSchema);

export default RetailStock;

export { HospitalRetailStock };