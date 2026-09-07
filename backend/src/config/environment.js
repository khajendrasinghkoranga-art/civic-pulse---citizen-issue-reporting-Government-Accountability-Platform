const required = () => {
  // Test processes intentionally do not use DATABASE_URL. Database-mutating
  // tests opt in through TEST_DATABASE_URL, while non-database tests can run
  // without any database connection at all.
  if (process.env.NODE_ENV === "test") return ["JWT_SECRET"];
  return ["DATABASE_URL", "JWT_SECRET"];
};

const getEnvironment = () => ({
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  uploadDir: process.env.UPLOAD_DIR || "uploads",
});

const validateEnvironment = () => {
  const missing = required().filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
};

module.exports = { getEnvironment, validateEnvironment };
