const express = require("express");
const cors = require("cors");

const apiRoutes = require("./routes");
const { notFound, errorHandler } = require("./middleware/error.middleware");
const { uploadDirectory } = require("./config/storage");
const { createRateLimit } = require("./middleware/rateLimit.middleware");

const app = express();

app.use(cors());
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
