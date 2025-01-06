import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/mongoDb.js";
import FormData from "./models/formModel.js";
import cors from "cors";

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
app.get("/api/forms/all_leads", async (req, res) => {
  try {
    const forms = await FormData.find();
    res.status(200).json(forms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
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
// queries for dashboard startfrom here

// Utility Functions
const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
const endOfToday = new Date(new Date().setHours(23, 59, 59, 999));
const startOfMonth = new Date(
  new Date().getFullYear(),
  new Date().getMonth(),
  1
);
const endOfMonth = new Date(
  new Date().getFullYear(),
  new Date().getMonth() + 1,
  0,
  23,
  59,
  59,
  999
);

// API Endpoints

// Total count of objects
app.get("/api/total-count", async (req, res) => {
  try {
    const count = await FormData.countDocuments({});
    res.json({ totalCount: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Conversion Ratio API
app.get("/api/conversion-ratio", async (req, res) => {
  try {
    const totalLeads = await FormData.countDocuments();
    const wonLeads = await FormData.countDocuments({ status: "won" });

    if (totalLeads === 0) {
      return res.json({ conversionRatio: 0 });
    }

    const conversionRatio = (wonLeads / totalLeads) * 100;
    res.json({ conversionRatio: conversionRatio.toFixed(2) }); // Returning a percentage with 2 decimal points
  } catch (error) {
    console.error("Error calculating conversion ratio:", error.message);
    res.status(500).json({ error: "Failed to calculate conversion ratio" });
  }
});
// Today's leads
app.get("/api/todays-leads", async (req, res) => {
  try {
    const leads = await FormData.find({
      createdAt: { $gte: startOfToday, $lt: endOfToday },
    });
    res.json({ count: leads.length, leads });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// This month's leads
app.get("/api/month-leads", async (req, res) => {
  try {
    const leads = await FormData.find({
      createdAt: { $gte: startOfMonth, $lt: endOfMonth },
    });
    res.json({ count: leads.length, leads });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Total payment required
app.get("/api/total-payment-required", async (req, res) => {
  try {
    const result = await FormData.aggregate([
      { $match: { total_payment_required: { $ne: null } } }, // Exclude null values
      {
        $group: {
          _id: null,
          totalPaymentRequired: { $sum: "$total_payment_required" },
        },
      },
    ]);
    res.json({ totalPaymentRequired: result[0]?.totalPaymentRequired || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Total amount paid
app.get("/api/total-paid", async (req, res) => {
  try {
    const result = await FormData.aggregate([
      { $unwind: "$addedPayments" },
      { $match: { "addedPayments.amount": { $ne: null } } }, // Exclude null values
      { $group: { _id: null, totalPaid: { $sum: "$addedPayments.amount" } } },
    ]);
    res.json({ totalPaid: result[0]?.totalPaid || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remaining amount
app.get("/api/remaining-amount", async (req, res) => {
  try {
    const result = await FormData.aggregate([
      {
        $project: {
          totalPaymentRequired: { $ifNull: ["$total_payment_required", 0] },
          totalPaid: {
            $sum: {
              $map: {
                input: "$addedPayments",
                as: "payment",
                in: { $ifNull: ["$$payment.amount", 0] },
              },
            },
          },
        },
      },
      {
        $project: {
          remaining: { $subtract: ["$totalPaymentRequired", "$totalPaid"] },
        },
      },
    ]);
    const totalRemaining = result.reduce(
      (acc, item) => acc + item.remaining,
      0
    );
    res.json({ totalRemaining });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//queries for dashboard ends here

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

//last 30days report
app.get("/api/leads-last-30-days", async (req, res) => {
  try {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 30);

    const leads = await FormData.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: today },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formattedData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const formattedDate = date.toISOString().split("T")[0];

      const lead = leads.find((lead) => lead._id === formattedDate);
      return {
        date: formattedDate,
        count: lead ? lead.count : 0,
      };
    }).reverse();

    res.json({
      labels: formattedData.map((data) => {
        const date = new Date(data.date);
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }),
      data: formattedData.map((data) => data.count),
    });
  } catch (error) {
    console.error("Error fetching leads for last 30 days:", error.message);
    res.status(500).json({ error: "Failed to fetch leads for last 30 days" });
  }
});

// status for bargraph
app.get("/api/leads-status-count", async (req, res) => {
  try {
    const statusCounts = await FormData.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      labels: statusCounts.map((status) => status._id),
      data: statusCounts.map((status) => status.count),
    });
  } catch (error) {
    console.error("Error fetching status counts:", error.message);
    res.status(500).json({ error: "Failed to fetch status counts" });
  }
});

//DoughNut charts

app.get("/api/leads-source-count", async (req, res) => {
  try {
    const leads = await FormData.find();
    const sourceCounts = {};

    leads.forEach((lead) => {
      const source =
        lead.source &&
        (lead.source.startsWith("http") || lead.source.startsWith("www"))
          ? "website"
          : lead.source || "Unknown";

      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });

    const labels = Object.keys(sourceCounts);
    const data = Object.values(sourceCounts);

    res.json({ labels, data });
  } catch (error) {
    console.error("Error fetching source data:", error.message);
    res.status(500).json({ error: "Failed to fetch source data" });
  }
});

//expenses API ends here
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
