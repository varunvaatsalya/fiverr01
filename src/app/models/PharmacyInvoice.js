import mongoose from "mongoose";

const returnSchema = new mongoose.Schema({
  returnId: String,
  medicines: [
    {
      medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medicine",
        required: true,
      },
      returnStock: [
        {
          batchName: String,
          expiryDate: Date,
          sellingPrice: Number,
          quantity: {
            strips: Number,
            tablets: Number,
          },
          price: Number,
        },
      ],
    },
  ],
  isReturnAmtPaid: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const pharmacyInvoiceSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  inid: {
    type: String,
    required: true,
  },
  medicines: [
    {
      medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medicine",
        required: true,
      },
      status: { type: String, required: true },
      isDiscountApplicable: { type: Boolean },
      allocatedStock: [
        {
          batchName: {
            type: String,
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
          purchasePrice: {
            type: Number,
            required: true,
          },
          sellingPrice: {
            type: Number,
            required: true,
          },
          quantity: {
            strips: { type: Number, default: 0 },
            tablets: { type: Number, default: 0 },
          },
        },
      ],
    },
  ],
  returns: [returnSchema],
  paymentMode: {
    type: String,
    required: true,
  },
  price: {
    discount: {
      type: Number,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  payments: [{ type: { type: String }, amount: { type: Number } }],
  isDelivered: {
    type: Date,
  },
  updates: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuditTrail",
    },
  ],
  createdByRole: {
    type: String,
    enum: ["admin", "salesman", "dispenser"],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

pharmacyInvoiceSchema.index({ "returns.createdAt": 1 });

export default mongoose.models.PharmacyInvoice ||
  mongoose.model("PharmacyInvoice", pharmacyInvoiceSchema);
