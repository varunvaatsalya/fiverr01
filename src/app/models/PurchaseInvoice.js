const mongoose = require("mongoose");

const purchaseInvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  manufacturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Manufacturer",
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
  },
  stocks: [
    {
      stockId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stock",
      },
      insertedAt: { type: Date, default: Date.now },
    },
  ],
  grandTotal: { type: Number },
  // discount: { type: Number, default: 0 },
  // taxes: { type: Number, default: 0 },
  // finalAmount: { type: Number },
  payments: [
    {
      amount: { type: Number, required: true },
      date: { type: Date, required: true },
      referenceNumber: { type: String },
      bankDetails: {
        accountHolderName: {
          type: String,
        },
        bankName: {
          type: String,
        },
        accountNo: {
          type: String,
        },
        ifsc: {
          type: String,
        },
        branch: {
          type: String,
        },
      },
      mode: {
        type: String,
        required: true,
      },
    },
  ],
  isPaid: { type: Boolean, default: false },
  invoiceDate: { type: Date, required: true },
  receivedDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

purchaseInvoiceSchema.path("manufacturer").validate(function (value) {
  return this.vendor || value; // manufacturer ho ya vendor, ek to hona chahiye
}, "Either vendor or manufacturer is required.");

purchaseInvoiceSchema.path("vendor").validate(function (value) {
  return this.manufacturer || value; // manufacturer ho ya vendor, ek to hona chahiye
}, "Either vendor or manufacturer is required.");

export default mongoose.models.PurchaseInvoice ||
  mongoose.model("PurchaseInvoice", purchaseInvoiceSchema);
