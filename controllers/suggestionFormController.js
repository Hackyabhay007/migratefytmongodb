import SuggestionForm from "../models/SuggestionForm.js";

// Create a new suggestion form
export const createSuggestionForm = async (req, res) => {
  try {
    const suggestionForm = new SuggestionForm(req.body);
    await suggestionForm.save();
    res
      .status(201)
      .json({
        message: "Suggestion form created successfully",
        data: suggestionForm,
      });
  } catch (error) {
    res
      .status(400)
      .json({
        message: "Error creating suggestion form",
        error: error.message,
      });
  }
};

// Get all suggestion forms
export const getAllSuggestionForms = async (req, res) => {
  try {
    const forms = await SuggestionForm.find();
    res
      .status(200)
      .json({
        message: "Suggestion forms retrieved successfully",
        data: forms,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error retrieving suggestion forms",
        error: error.message,
      });
  }
};

// Get a single suggestion form by ID
export const getSuggestionFormById = async (req, res) => {
  try {
    const form = await SuggestionForm.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ message: "Suggestion form not found" });
    }
    res
      .status(200)
      .json({ message: "Suggestion form retrieved successfully", data: form });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error retrieving suggestion form",
        error: error.message,
      });
  }
};

// Update a suggestion form by ID
export const updateSuggestionForm = async (req, res) => {
  try {
    const form = await SuggestionForm.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!form) {
      return res.status(404).json({ message: "Suggestion form not found" });
    }
    res
      .status(200)
      .json({ message: "Suggestion form updated successfully", data: form });
  } catch (error) {
    res
      .status(400)
      .json({
        message: "Error updating suggestion form",
        error: error.message,
      });
  }
};

// Delete a suggestion form by ID
export const deleteSuggestionForm = async (req, res) => {
  try {
    const form = await SuggestionForm.findByIdAndDelete(req.params.id);
    if (!form) {
      return res.status(404).json({ message: "Suggestion form not found" });
    }
    res.status(200).json({ message: "Suggestion form deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error deleting suggestion form",
        error: error.message,
      });
  }
};
