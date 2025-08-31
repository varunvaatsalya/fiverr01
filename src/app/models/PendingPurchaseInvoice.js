// models/PendingPurchaseInvoice.js
import mongoose from "mongoose";

const PendingPurchaseInvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    vendorInvoiceId: { type: String },
    type: { type: String, enum: ["Vendor", "Manufacturer"], required: true },
    source: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "type",
      required: true,
    },

    invoiceDate: { type: Date, required: true },
    receivedDate: { type: Date, required: true },
    isBackDated: { type: Boolean, default: false },
    sectionType: { type: String }, // Optional if used

    stocks: [
      {
        medicine: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Medicine",
          required: true,
        },
        batchName: String,
        mfgDate: Date,
        expiryDate: Date,
        currentQuantity: Number,
        initialQuantity: Number,
        offer: Number,
        sellingPrice: Number,
        purchasePrice: Number,
        discount: Number,
        sgst: Number,
        cgst: Number,
      },
    ],

    billImageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FileAsset", // if you're storing bill photo
    },
    billImageIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FileAsset",
      },
    ],
    submittedBy: {
      id: String,
      email: String,
      role: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "editing"],
      default: "pending",
    },
    rejectionReason: { type: String },
    expireAt: {
      type: Date,
      default: null,
      index: { expires: 0 }, // TTL index
    },
  },
  { timestamps: true }
);

export default mongoose.models.PendingPurchaseInvoice ||
  mongoose.model("PendingPurchaseInvoice", PendingPurchaseInvoiceSchema);
