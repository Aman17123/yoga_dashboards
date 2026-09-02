import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

//mongooooose
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MONGO DB BROOO"))
  .catch((err) => console.error("MONGO Connection Err:", err));

//api test
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date(),
    message: "api is Running Smoothly...",
  });
});
//server start
app.listen(PORT, () => {
  console.log(`Server is running on this port ${PORT}`);
});
