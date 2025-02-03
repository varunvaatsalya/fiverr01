// models/User.js
import mongoose from 'mongoose';

const pharmacyUserSchema = new mongoose.Schema({
  uid: {
    type: String,
  },
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
    ],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['dispenser', 'stockist'],
    required: true,
  },
  editPermission: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.PharmacyUser || mongoose.model('PharmacyUser', pharmacyUserSchema);
