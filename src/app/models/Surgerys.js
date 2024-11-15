const mongoose = require("mongoose");

const surgerySchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., Nursing care, Lab tests
  items: [{ name: String }], // e.g., Nursing care, Lab tests
  price: { type: Number, required: true }, // Associated charge
});


const Surgery =
  mongoose.models.Surgery || mongoose.model("Surgery", surgerySchema);
const Package =
  mongoose.models.Package || mongoose.model("Package", packageSchema);

module.exports = { Surgery, Package };
