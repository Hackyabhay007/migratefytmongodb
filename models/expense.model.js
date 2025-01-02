// expense.model.js
import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  namedExpenses: [
    { category: String, customExpenseName: String, amount: Number },
  ],
  employeeDetails: [
    { employeeName: String, designation: String, monthlySalary: Number },
  ],
  projectDetails: [
    {
      date: Date,
      projectName: String,
      projectExpenseAmount: Number,
      projectNotes: String,
    },
  ],
});

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;
