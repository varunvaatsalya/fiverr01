const mongoose = require("mongoose");

const bedSchema = new mongoose.Schema({
  bed: { type: mongoose.Schema.Types.ObjectId, ref: "Bed", required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
});

const doctorSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  visitingDate: { type: Date, default: Date.now, required: true },
});

const surgerySchema = new mongoose.Schema({
  surgery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Surgery",
    required: true,
  },
  date: { type: Date, default: Date.now, required: true },
});

const packageSchema = new mongoose.Schema({
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Package",
    required: true,
  },
  date: { type: Date, default: Date.now, required: true },
});


const paymentFormatSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true, default: Date.now },
});

const insuranceInfoSchema = new mongoose.Schema({
  providerName: { type: String, required: true },
  tpa: { type: String },
  coverageAmount: { type: Number },
  payments: [
    {
      amount: { type: Number, required: true },
      txno: { type: String, required: true },
      bankName: { type: String, required: true },
      date: { type: Date, required: true, default: Date.now },
    },
  ],
});

const admissionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  reason: { type: String },
  adid: {
    type: String,
    required: [true, "Please provide a UID"],
  },

  currentBed: bedSchema,
  bedHistory: [bedSchema],

  doctor: [doctorSchema],
  surgery: [surgerySchema],
  package: [packageSchema],

  insuranceInfo: insuranceInfoSchema,

  supplementaryService: [paymentFormatSchema],

  otherServices: [paymentFormatSchema],

  ipdPayments: [paymentFormatSchema],

  admissionDate: { type: Date, default: Date.now },
  dischargeDate: { type: Date, default: null },
  isCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, required: true },
});

export default mongoose.models.Admission ||
  mongoose.model("Admission", admissionSchema);
