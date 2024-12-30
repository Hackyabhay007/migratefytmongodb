import mongoose from "mongoose";

// Define the schema
const formSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: false },
  company: { type: String, required: false },
  budget: { type: Number, required: false },
  source: { type: String, default: "" },
  status: { type: String, default: "new" },
  projectStartDate: { type: Date, default: null },
  projectEndDate: { type: Date, default: null },
  projectStatus: { type: String, default: "" },
  projectLink: { type: String, default: "" },
  projectNotes: { type: String, default: "" },
  proposedCost: { type: Number, default: 0 },
  proposalLink: { type: String, default: "" },
  proposalNotes: { type: String, default: "" },
  proposalStatus: { type: String, default: "" },
  proposalDate: { type: Date, default: null },
  lastContactDate: { type: Date, default: null },
  firstFollowUpDate: { type: Date, default: null },
  nextFollowUpDate: { type: Date, default: null },
  followUpNotes: { type: String, default: "" },
  internalNotes: { type: String, default: "" },
  assignedTo: { type: String, default: "" },
  tags: { type: [String], default: [] },
  priority: { type: String, default: "" },
  total_payment_required: { type: Number, default: 0 },
  addedPayments: [
    {
      amount: { type: Number, required: true },
      date: { type: Date, required: true },
      method: { type: String, required: true },
      notes: { type: String, default: "" },
    },
  ],
});

// Create the model
const FormData = mongoose.model("FormData", formSchema);

export default FormData;
