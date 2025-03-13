// import mongoose from "mongoose";

// const expenseSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   amount: { type: Number, required: true },
//   quantity: { type: Number },
//   validity: { type: String },
//   expenseMessage: { type: String },
//   createdAt: { type: Date, default: Date.now },
// });

// export default mongoose.models.Expense ||
//   mongoose.model("Expense", expenseSchema);

import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  category: { type: String, required: true }, //--
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  quantity: { type: Number },
  units: { type: String, required: true }, //--
  cost_per_unit: { type: String, required: true }, //--

  validity: { type: String },
  expenseMessage: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Expense ||
  mongoose.model("Expense", expenseSchema);
