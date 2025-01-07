import express from "express";
import {
  createSuggestionForm,
  getAllSuggestionForms,
  getSuggestionFormById,
  updateSuggestionForm,
  deleteSuggestionForm,
} from "../controllers/suggestionFormController.js";

const router = express.Router();

router.post("/", createSuggestionForm);
router.get("/", getAllSuggestionForms);
router.get("/:id", getSuggestionFormById);
router.put("/:id", updateSuggestionForm);
router.delete("/:id", deleteSuggestionForm);

export default router;
