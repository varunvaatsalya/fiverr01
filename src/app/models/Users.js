// models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: [true, "Please provide a UID"],
  },
  name: {
    type: String,
    required: [true, "Please provide a name"],
    maxlength: [60, "Name cannot be more than 60 characters"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: [
      "owner",
      "salesman",
      "nurse",
      "pathologist",
      "dispenser",
      "stockist",
    ],
    required: true,
  },
  editPermission: {
    type: Boolean,
    default: false,
  },
  logout: {
    lastLogoutByAdmin: {
      type: Date,
    },
    isLogoutPending: { type: Boolean },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models?.User || mongoose.model("User", UserSchema);
