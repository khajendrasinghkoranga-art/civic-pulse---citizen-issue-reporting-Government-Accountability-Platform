const notFound = (req, res) => res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
const errorHandler = (error, _req, res, _next) => {
  console.error(error);
  if (res.headersSent) return;
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ success: false, message: "Invalid JSON request body" });
  }
  if (error.code === "P2002") {
    return res.status(409).json({ success: false, message: "A record with this value already exists" });
  }
  return res.status(error.statusCode || 500).json({ success: false, message: error.expose ? error.message : "Internal server error" });
};

module.exports = { notFound, errorHandler };
