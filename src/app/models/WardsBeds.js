const mongoose = require("mongoose");

const wardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  beds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bed" }]
});

const bedSchema = new mongoose.Schema({
    ward: { type: mongoose.Schema.Types.ObjectId, ref: "Ward", required: true }, // Reference to the Ward
    bedName: { type: String, required: true }, // Bed identifier (e.g., "B1", "B2", etc.)
    isOccupied: { type: Boolean, default: false },
    price: { type: Number },
    
    // Occupancy details if the bed is occupied
    occupancy: {
      patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", default: null },
      admissionId: { type: mongoose.Schema.Types.ObjectId, ref: "Admission", default: null },
      startDate: { type: Date, default: null },
      additionalInfo: { type: String } // Any additional notes on occupancy (optional)
    }
  });

  const Ward = mongoose.models.Ward || mongoose.model("Ward", wardSchema);
  const Bed = mongoose.models.Bed || mongoose.model("Bed", bedSchema);
  
  module.exports = { Ward, Bed };