import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db/pool.js";
import apiRouter from "./routes/api.js";
import { seedDatabaseIfEmpty } from "./utils/seedData.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;


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
try {
  const connection = await pool.getConnection();
  console.log(`Connected to MySQL database: ${process.env.DB_NAME || "yoga_dashboard"}`);
  connection.release();
  await seedDatabaseIfEmpty();
} catch (err) {
  console.error("MySQL Connection Error:", err);
}


// API Routes
app.use("/api", apiRouter);

// Serve frontend static build in production if available
const clientDistPath = fs.existsSync(path.resolve(__dirname, "client/dist"))
  ? path.resolve(__dirname, "client/dist")
  : path.resolve(__dirname, "../client/dist");

console.log(`[Frontend] Static build path: ${clientDistPath} (exists: ${fs.existsSync(clientDistPath)})`);

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.use((req, res, next) => {
    // If request is for an unhandled /api route, pass to next error/404 handler
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "API route not found" });
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

// Central error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.message);
  console.error(err.stack);
  res.status(500).json({ error: "An unexpected server error occurred.", detail: err.message });
});

// Server listener
app.listen(PORT, "0.0.0.0", () => {
  console.log(`yogaonlive API running on http://localhost:${PORT}`);
});
