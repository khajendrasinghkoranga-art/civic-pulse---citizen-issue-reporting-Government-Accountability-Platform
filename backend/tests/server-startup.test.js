const test = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const path = require("node:path");

test("server starts with test-safe settings and background jobs disabled", async () => {
  const child = spawn(process.execPath, ["src/server.js"], {
    cwd: path.resolve(__dirname, ".."),
    env: {
      ...process.env,
      NODE_ENV: "test",
      ENABLE_BACKGROUND_JOBS: "false",
      JWT_SECRET: "test-jwt-secret",
      PORT: "0",
      // Do not provide TEST_DATABASE_URL: this verifies startup does not need
      // or connect to the development database.
      TEST_DATABASE_URL: "",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let output = "";
  let startupTimeout;
  child.stdout.on("data", (chunk) => { output += chunk; });
  child.stderr.on("data", (chunk) => { output += chunk; });

  try {
    await Promise.race([
      new Promise((resolve, reject) => {
        child.once("error", reject);
        child.stdout.on("data", () => {
          if (output.includes("Server is running on port")) resolve();
        });
        child.once("exit", (code) => reject(new Error(`Server exited before startup (code ${code}): ${output}`)));
      }),
      new Promise((_, reject) => {
        startupTimeout = setTimeout(() => reject(new Error(`Server startup timed out: ${output}`)), 5_000);
      }),
    ]);
    assert.match(output, /Server is running on port/);
  } finally {
    clearTimeout(startupTimeout);
    if (!child.killed) child.kill();
    await new Promise((resolve) => child.once("exit", resolve));
  }
});
