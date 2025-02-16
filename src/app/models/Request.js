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
    enteredRemainingQuantity: {
      type: Number,
    },
    actualRemainingQuantity: {
      type: Number,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Rejected",
        "Disputed",
        "Returned",
        "Fulfilled",
        "Fulfilled (Partial)",
      ],
      default: "Pending",
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    approvedQuantity: [
      {
        stockId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Stock",
        },
        batchName: {
          type: String,
        },
        mfgDate: {
          type: Date,
        },
        expiryDate: {
          type: Date,
        },
        packetSize: {
          strips: {
            type: Number,
          },
          tabletsPerStrip: {
            type: Number,
          },
        },
        quantity: {
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
        purchasePrice: {
          type: Number,
        },
        sellingPrice: {
          type: Number,
        },
      },
    ],
    receivedStatus: {
      type: String,
      enum: ["Not Received", "Fully Received", "Rejected"],
      default: "Not Received",
    },
    receivedAt: {
      type: Date,
      default: null,
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
