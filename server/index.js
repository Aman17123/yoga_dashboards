import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import apiRouter from "./routes/api.js";
import { seedDatabaseIfEmpty } from "./utils/seedData.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// HTTP & WebSocket server
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

io.on("connection", (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Real-time broadcast helper
export function emitRealtimeEvent(event, payload) {
  if (io) {
    io.emit(event, payload);
    console.log(`[Socket.io] Broadcasted event: ${event}`);
  }
}

// Middleware
app.use(
  cors({
    origin: "*", // Allow external yoga websites to POST bookings
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  console.error("Unhandled Error:", err.message);
  console.error(err.stack);
  res.status(500).json({ error: "An unexpected server error occurred.", detail: err.message });
});

// Server listener
server.listen(PORT, "0.0.0.0", () => {
  console.log(`yogaonlive API running on http://localhost:${PORT}`);
});
