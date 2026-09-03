import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import apiRouter from "./routes/api.js";
import { seedDatabaseIfEmpty } from "./utils/seedData.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection & auto-seeding
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB Atlas: yoga_dashboard");
    await seedDatabaseIfEmpty();
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
  });

// API Routes
app.use("/api", apiRouter);

// Central error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ error: "An unexpected server error occurred." });
});

// Server listener
app.listen(PORT, () => {
  console.log(`Meridian Studio API is running on http://localhost:${PORT}`);
});
