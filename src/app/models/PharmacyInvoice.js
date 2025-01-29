import mongoose from "mongoose";

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
  paymentMode: {
    type: String,
    required: true,
  },
  // biller: {
  //   type: String,
  //   required: true,
  //   default: "Temporary Biller",
  // },
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
  isDelivered: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.PharmacyInvoice ||
  mongoose.model("PharmacyInvoice", pharmacyInvoiceSchema);
