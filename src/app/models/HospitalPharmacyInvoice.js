import mongoose from "mongoose";

const hospitalPharmacyInvoiceSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  entries: [
    {
      time: {
        type: Date,
        required: true,
      },
      nurse: {
        type: String,
      },
      medicines: [
        {
          medicineId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Medicine",
          },
          batchName: {
            type: String,
            required: true,
          },
          expiryDate: {
            type: Date,
            required: true,
          },
          quantity: { strips: Number, tablets: Number },
        },
      ],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.HospitalPharmacyInvoice ||
  mongoose.model("HospitalPharmacyInvoice", hospitalPharmacyInvoiceSchema);
