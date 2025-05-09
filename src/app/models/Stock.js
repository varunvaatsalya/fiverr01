import PurchaseInvoice from "./PurchaseInvoice";

const mongoose = require("mongoose");

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
  totalAmount: { type: Number, required: true },
  invoiceId: {
    type: String,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

stockSchema.post("save", async function (doc) {
  const Stock = this.constructor;

  const invoice = await PurchaseInvoice.findOne({ "stocks.stockId": doc._id });
  if (invoice) {
    const stocks = await Stock.find({ _id: { $in: invoice.stocks } });
    const total = stocks.reduce((sum, s) => sum + s.totalAmount, 0);
    invoice.grandTotal = total;
    await invoice.save();
  }
});

export default mongoose.models.Stock || mongoose.model("Stock", stockSchema);
