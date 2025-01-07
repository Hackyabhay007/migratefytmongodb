import mongoose from "mongoose";

const SuggestionFormSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    formType: { type: String, trim: true },
    message: { type: String, trim: true },
    services: { type: [String] },
    technologies: { type: [String] },
  },
  {
    collection: "SuggestionForms",
    timestamps: true,
  }
);

const SuggestionForm = mongoose.model("SuggestionForm", SuggestionFormSchema);

export default SuggestionForm;
