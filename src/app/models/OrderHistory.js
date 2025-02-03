import mongoose from "mongoose";

const orderHistorySchema = new mongoose.Schema({
  to: { type: String, required: true },
  mrName: { type: String },
  contact: { type: Number, required: true },
  medicines: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.OrderHistory ||
  mongoose.model("OrderHistory", orderHistorySchema);

// export default Patient;
