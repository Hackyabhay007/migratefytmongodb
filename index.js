import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/mongoDb.js";
import FormData from "./models/formModel.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // Parse incoming JSON requests

// Connect to MongoDB
connectDB();

// Health Check Route
app.get("/", (req, res) => {
  res.send("Server is running and connected!");
});

// API Routes

// Create a new document
app.post("/api/forms", async (req, res) => {
  try {
    const newFormData = new FormData(req.body);
    const savedForm = await newFormData.save();
    res.status(201).json(savedForm);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch all forms
app.get("/api/forms", async (req, res) => {
  try {
    const forms = await FormData.find();
    res.status(200).json(forms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Update a form by ID
app.put("/api/forms/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const updatedForm = await FormData.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedForm) {
      return res.status(404).json({ error: "Form not found" });
    }

    res.status(200).json(updatedForm);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a form by ID
app.delete("/api/forms/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedForm = await FormData.findByIdAndDelete(id);

    if (!deletedForm) {
      return res.status(404).json({ error: "Form not found" });
    }

    res.status(200).json({ message: "Form deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
