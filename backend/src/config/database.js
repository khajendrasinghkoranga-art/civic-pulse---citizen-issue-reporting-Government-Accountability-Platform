const { PrismaClient } = require("@prisma/client");

const SAFE_UNAVAILABLE_DATABASE_URL = "postgresql://invalid:invalid@127.0.0.1:1/civicpulse_test?connect_timeout=1";
const isTest = process.env.NODE_ENV === "test";
const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (isTest && testDatabaseUrl && testDatabaseUrl === process.env.DATABASE_URL) {
  throw new Error("TEST_DATABASE_URL must not be the same as DATABASE_URL");
}

// Never mutate DATABASE_URL in a test process. Passing the datasource directly
// makes it impossible for Prisma to fall back to the development URL.
const databaseUrl = isTest ? (testDatabaseUrl || SAFE_UNAVAILABLE_DATABASE_URL) : process.env.DATABASE_URL;

// Singleton pattern — prevents multiple PrismaClient instances in dev (hot-reload)
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: databaseUrl } },
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
