import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  quantity: { type: Number },
  validity: { type: String },
  expenseMessage: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Expense ||
  mongoose.model("Expense", expenseSchema);

// export default Expense;
