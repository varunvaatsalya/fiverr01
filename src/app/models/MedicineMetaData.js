const mongoose = require('mongoose');

// Manufacturer Schema
const ManufacturerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  createdAt: { type: Date, default: Date.now, required: true },
});

// Vendor Schema
const VendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  contact: {
    type: Number,
  },
  createdAt: { type: Date, default: Date.now, required: true },
});

// Medicine Representator (MR) Schema
const MedicalRepresentatorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  contact: {
    type: Number,
    required: true,
  },
  createdAt: { type: Date, default: Date.now, required: true },
});

// Salt Schema
const SaltSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  useCase: {
    type: String,
  },
  comment: {
    type: String,
  },
  createdAt: { type: Date, default: Date.now, required: true },
});


const Manufacturer = mongoose.models.Manufacturer || mongoose.model("Manufacturer", ManufacturerSchema);
const Vendor = mongoose.models.Vendor || mongoose.model("Vendor", VendorSchema);
const MedicalRepresentator = mongoose.models.MedicalRepresentator || mongoose.model("MedicalRepresentator", MedicalRepresentatorSchema);
const Salt = mongoose.models.Salt || mongoose.model("Salt", SaltSchema);

module.exports = { Manufacturer, Vendor, MedicalRepresentator, Salt };
