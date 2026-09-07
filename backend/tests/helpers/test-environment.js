const developmentDatabaseUrl = process.env.DATABASE_URL;
const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (testDatabaseUrl && developmentDatabaseUrl && testDatabaseUrl === developmentDatabaseUrl) {
  throw new Error("TEST_DATABASE_URL must not be the same as DATABASE_URL");
}

process.env.NODE_ENV = "test";
process.env.ENABLE_BACKGROUND_JOBS = "false";
process.env.JWT_SECRET ||= "test-jwt-secret";

module.exports = {
  hasTestDatabase: Boolean(testDatabaseUrl),
  testDatabaseUrl,
};
