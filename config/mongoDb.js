import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI); // No need for deprecated options
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error(
      "Error connecting to MongoDB:",
      error.message,
      process.env.MONGODB_URI
    );
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
