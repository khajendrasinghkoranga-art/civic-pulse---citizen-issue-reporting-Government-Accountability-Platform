const express = require("express");
const cors = require("cors");

const apiRoutes = require("./routes");
const { notFound, errorHandler } = require("./middleware/error.middleware");
const { uploadDirectory } = require("./config/storage");
const { createRateLimit } = require("./middleware/rateLimit.middleware");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
      return callback(null, true);
    }
    // Allow any vercel preview deployment or local dev
    if (origin.endsWith(".vercel.app") || origin.includes("localhost") || origin.includes("127.0.0.1") || origin.includes(".exp.direct")) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive for mobile & cross-origin apps
  },
  credentials: true,
}));
app.use(express.json({ limit: "7mb" }));
app.use("/uploads", express.static(uploadDirectory));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CivicPulse API is running",
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
  });
});

app.use("/api/v1", createRateLimit());
app.use("/api/v1", apiRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
