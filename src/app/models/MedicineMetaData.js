const mongoose = require("mongoose");

// Manufacturer Schema
const ManufacturerSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  medicalRepresentator: {
    name: {
      type: String,
    },
    contact: {
      type: Number,
    },
  },
  createdAt: { type: Date, default: Date.now, required: true },
});

// Vendor Schema
const VendorSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  contact: {
    type: Number,
  },
  bankDetails: {
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
  address: {
    type: String,
  },
  createdAt: { type: Date, default: Date.now, required: true },
});

// Salt Schema
const SaltSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  useCase: {
    type: String,
  },
  createdAt: { type: Date, default: Date.now, required: true },
});

const Manufacturer =
  mongoose.models.Manufacturer ||
  mongoose.model("Manufacturer", ManufacturerSchema);
const Vendor = mongoose.models.Vendor || mongoose.model("Vendor", VendorSchema);
const Salt = mongoose.models.Salt || mongoose.model("Salt", SaltSchema);

module.exports = { Manufacturer, Vendor, Salt };
