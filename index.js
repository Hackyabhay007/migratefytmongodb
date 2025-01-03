import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/mongoDb.js";
import FormData from "./models/formModel.js";
import cors from "cors";
// import {
//   createExpense,
//   getExpenseById,
//   updateExpenseById,
//   deleteExpenseById,
// } from "./controllers/expenseApi.js";

import {
  createExpense,
  getExpenseById,
  updateExpenseById,
  deleteExpenseById,
} from "./controllers/expenseApi.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:3000" }));
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
// app.get("/api/forms", async (req, res) => {
//   try {
//     const forms = await FormData.find();
//     res.status(200).json(forms);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
// app.get("/api/forms", async (req, res) => {
//   try {
//     // Extract query parameters for pagination, filters, and sorting
//     const {
//       page = 1,
//       limit = 10,
//       sortField = "createdAt",
//       sortOrder = "desc",
//       ...filters
//     } = req.query;

//     // Convert page and limit to integers
//     const pageNum = parseInt(page, 10);
//     const limitNum = parseInt(limit, 10);

//     // Convert sorting order to numeric format for MongoDB
//     const sortOrderNum = sortOrder === "asc" ? 1 : -1;

//     // Apply filters (e.g., field=value)
//     const query = {};
//     for (const [key, value] of Object.entries(filters)) {
//       query[key] = value;
//     }

//     // Calculate skip value for pagination
//     const skip = (pageNum - 1) * limitNum;

//     // Query the database with filters, pagination, and dynamic sorting
//     const forms = await FormData.find(query)
//       .skip(skip)
//       .limit(limitNum)
//       .sort({ [sortField]: sortOrderNum }); // Dynamic sorting

//     // Get total count of documents for pagination metadata
//     const total = await FormData.countDocuments(query);

//     // Send response with data and pagination metadata
//     res.status(200).json({
//       total,
//       page: pageNum,
//       limit: limitNum,
//       totalPages: Math.ceil(total / limitNum),
//       data: forms,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

//new query

app.get("/api/forms", async (req, res) => {
  try {
    // Extract query parameters for pagination, filters, and sorting
    const {
      page = 1,
      limit = 10,
      sortField = "createdAt",
      search = "",
      sortOrder = "desc",
      ...filters
    } = req.query;

    // Convert page and limit to integers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Convert sorting order to numeric format for MongoDB
    const sortOrderNum = sortOrder === "asc" ? 1 : -1;

    // Build query to exclude objects with null values in requested filters and sortField
    const query = {};

    // If search query is provided, add it to the query to search across fields
    if (search) {
      // Perform a case-insensitive search across multiple fields
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },

        // Add more fields if needed
      ];
    }
    // Check for the sortField and add condition to exclude null values
    if (sortField) {
      query[sortField] = { $ne: null }; // Ensure sortField (nextFollowUpDate) is not null
    }

    // Apply other filters (e.g., field=value) if provided in the query
    for (const [key, value] of Object.entries(filters)) {
      if (value !== "all" && value !== null) {
        query[key] = value; // Exclude values of "all" or null
      }
    }

    // Calculate skip value for pagination
    const skip = (pageNum - 1) * limitNum;

    // Query the database with filters, pagination, and dynamic sorting
    const [forms, total] = await Promise.all([
      FormData.find(query)
        .skip(skip)
        .limit(limitNum)
        .sort({ [sortField]: sortOrderNum })
        .lean(),
      FormData.countDocuments(query),
    ]);

    // Send response with data and pagination metadata
    res.status(200).json({
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      data: forms,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch a single form by ID
app.get("/api/forms/:id", async (req, res) => {
  const { id } = req.params; // Extract the ID from the route parameters

  try {
    const form = await FormData.findById(id); // Fetch the document by ID
    if (!form) {
      return res.status(404).json({ error: "Form not found" }); // Handle case where the document doesn't exist
    }
    res.status(200).json(form); // Respond with the found document
  } catch (error) {
    res.status(500).json({ error: error.message }); // Handle server errors
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

// expenses API starts from here

app.post("/api/expenses", async (req, res) => {
  try {
    const newExpense = await createExpense(req.body);
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/expenses/:id", async (req, res) => {
  try {
    const expense = await getExpenseById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/expenses/:id", async (req, res) => {
  try {
    const updatedExpense = await updateExpenseById(req.params.id, req.body);
    if (!updatedExpense)
      return res.status(404).json({ message: "Expense not found" });
    res.status(200).json(updatedExpense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/expenses/:id", async (req, res) => {
  try {
    const deletedExpense = await deleteExpenseById(req.params.id);
    if (!deletedExpense)
      return res.status(404).json({ message: "Expense not found" });
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//expenses API ends here
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
