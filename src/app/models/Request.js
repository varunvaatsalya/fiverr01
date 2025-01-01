const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
    },
    // retailer: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    //   required: true,
    // },
    requestedQuantity: {
      type: Number,  // Number Of Boxes
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Fulfilled"],
      default: "Pending",
    },
    approvedQuantity: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Request ||
  mongoose.model("Request", requestSchema);
