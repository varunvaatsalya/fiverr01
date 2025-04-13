import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  items: [{ name: String, price: Number }],
  price: {
    subtotal: {
      type: Number,
      default: function () {
        return this.items?.reduce((sum, item) => sum + (item.price || 0), 0);
      },
    },
    discount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: function () {
        return this.price.subtotal - this.price.discount;
      },
    },
  },
  paymentMode: {
    type: String,
    required: [true, "Please provide a Payment Mode"],
  },
  pid: {
    type: String,
    required: [true, "Please provide a UID"],
  },
  isPrint: {
    type: Boolean,
    default: false,
  },
  tests: [
    {
      ltrid: {
        type: String,
      },
      test: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LabTest", // Reference to the LabTest schema
      },
      results: [
        {
          name: String,
          result: String,
          unit: String,
        },
      ],
      resultDate: { type: Date },
      isCompleted: { type: Boolean, default: false },
    },
  ],
  createdByRole: {
    type: String,
    enum: ["admin", "salesman", "nurse"],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: { type: Date, default: Date.now, required: true },
});

export default mongoose.models.Prescription ||
  mongoose.model("Prescription", prescriptionSchema);
