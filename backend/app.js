import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import importRoutes from "./routes/import.js";
import { errorHandler } from "./middleware/error.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "CSV Importer Backend",
    provider: "Groq",
    model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
    hasApiKey: Boolean(
      process.env.GROQ_API_KEY &&
      process.env.GROQ_API_KEY !== "your_groq_api_key_here"
    ),
    timestamp: new Date().toISOString(),
  });
});

// Import API routes
app.use("/api", importRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

export default app;
