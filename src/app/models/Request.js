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
      type: Number, // Number Of Boxes
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Fulfilled", "Fulfilled (Partial)"],
      default: "Pending",
    },
    approvedQuantity: {
      boxes: {
        type: Number,
      },
      extra: {
        type: Number,
      },
      totalStrips: {
        type: Number,
      },
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
