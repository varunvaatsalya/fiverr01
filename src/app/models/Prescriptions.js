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
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
  },
  paymentMode: {
    type: String,
    required: [true, "Please provide a Payment Mode"],
  },
  payments: [{ type: { type: String }, amount: { type: Number } }],
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
      isExternalReport: { type: Boolean },
      isCompleted: { type: Boolean, default: false },
    },
  ],
  updates: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuditTrail",
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

prescriptionSchema.pre("save", function (next) {
  this.price.subtotal = this.items?.reduce(
    (sum, item) => sum + (item.price || 0),
    0
  );
  this.price.total = this.price.subtotal - this.price.discount;

  next();
});

export default mongoose.models.Prescription ||
  mongoose.model("Prescription", prescriptionSchema);
