import mongoose from "mongoose";

const expenseCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  subCategory: [{ name: { type: String, required: true } }],
  createdAt: { type: Date, default: Date.now },
});

const expenseSchema = new mongoose.Schema({
  category: { type: String },
  subCategory: { type: String },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  quantity: { type: Number },
  validity: { type: String }, // expenseDate
  expenseMessage: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const ExpenseCategory =
  mongoose.models.ExpenseCategory ||
  mongoose.model("ExpenseCategory", expenseCategorySchema);
const Expense =
  mongoose.models.Expense || mongoose.model("Expense", expenseSchema);

module.exports = { ExpenseCategory, Expense };
