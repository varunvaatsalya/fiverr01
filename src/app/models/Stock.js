// import PurchaseInvoice, { HospitalPurchaseInvoice } from "./PurchaseInvoice";

const mongoose = require("mongoose");

const HistorySchema = new mongoose.Schema({
  editedByRole: {
    type: String,
  },
  editedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  changes: {
    before: { type: mongoose.Schema.Types.Mixed },
    after: { type: mongoose.Schema.Types.Mixed },
  },
  changedAt: { type: Date, default: Date.now },
});

const stockSchema = new mongoose.Schema({
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
    required: true,
  },
  batchName: {
    type: String,
    required: true,
  },
  mfgDate: {
    type: Date,
  },
  packetSize: {
    strips: {
      type: Number,
    },
    tabletsPerStrip: {
      type: Number,
    },
  },
  expiryDate: {
    type: Date,
    required: true,
    default: () => {
      let date = new Date();
      date.setMonth(date.getMonth() - 6);
      return date;
    },
  },
  quantity: {
    boxes: {
      type: Number,
      required: true,
    },
    extra: {
      type: Number,
    },
    totalStrips: {
      type: Number,
      required: true,
    },
  },
  initialQuantity: {
    boxes: {
      type: Number,
      required: true,
    },
    extra: {
      type: Number,
    },
    offer: { type: Number },
    totalStrips: {
      type: Number,
      required: true,
    },
  },
  purchasePrice: {
    // net purchase rate
    type: Number,
    required: true,
  },
  purchaseRate: {
    // purchase rate raw (base)
    type: Number,
  },
  costPrice: {
    // cost rate
    type: Number,
  },
  sellingPrice: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
  },
  taxes: {
    sgst: {
      type: Number,
    },
    cgst: {
      type: Number,
    },
  },
  totalAmount: { type: Number, required: true },
  invoiceId: {
    type: String,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  updatehistory: [HistorySchema],
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

stockSchema.index({ medicine: 1, "quantity.totalStrips": 1, expiryDate: 1 });

// stockSchema.post("save", async function (doc) {
//   const Model = this.constructor;

//   let InvoiceModel =
//     Model.modelName === "HospitalStock"
//       ? HospitalPurchaseInvoice
//       : PurchaseInvoice;

//   let StockModel =
//     Model.modelName === "HospitalStock"
//       ? HospitalStock
//       : Stock;

//   const invoice = await InvoiceModel.findOne({ "stocks.stockId": doc._id });
//   if (invoice) {
//     const stockIds = invoice.stocks.map((s) => s.stockId);
//     const stocks = await StockModel.find({ _id: { $in: stockIds } });
//     const total = stocks.reduce((sum, s) => sum + s.totalAmount, 0);
//     invoice.grandTotal = total;
//     await invoice.save();
//   }
// });

// export default mongoose.models.Stock || mongoose.model("Stock", stockSchema);

const Stock = mongoose.models.Stock || mongoose.model("Stock", stockSchema);
const HospitalStock =
  mongoose.models.HospitalStock || mongoose.model("HospitalStock", stockSchema);

module.exports = { Stock, HospitalStock };
