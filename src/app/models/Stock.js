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
    const stockIds = invoice.stocks.map((s) => s.stockId);
    const stocks = await Stock.find({ _id: { $in: stockIds } });
    const total = stocks.reduce((sum, s) => sum + s.totalAmount, 0);
    invoice.grandTotal = total;
    await invoice.save();
  }
});

export default mongoose.models.Stock || mongoose.model("Stock", stockSchema);
