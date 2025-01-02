// expense.controller.js
import Expense from "../models/expense.model.js";

// Create an expense entry
export const createExpense = async (data) => {
  const expense = new Expense(data);
  return await expense.save();
};

// Read an expense by ID
export const getExpenseById = async (id) => {
  return await Expense.findOne({ id });
};

// Update an expense by ID
export const updateExpenseById = async (id, updates) => {
  return await Expense.findOneAndUpdate({ id }, updates, { new: true });
};

// Delete an expense by ID
export const deleteExpenseById = async (id) => {
  return await Expense.findOneAndDelete({ id });
};
