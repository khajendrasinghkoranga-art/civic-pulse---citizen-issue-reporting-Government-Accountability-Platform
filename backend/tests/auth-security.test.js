const test = require("node:test");
const assert = require("node:assert/strict");
require("./helpers/test-environment");
const { startServer, stopServer, request } = require("./helpers/http");

const app = require("../src/app");

const withServer = async (callback) => {
  const { server, port } = await startServer(app);
  try { await callback(port); } finally { await stopServer(server); }
};

test("protected issue route rejects a missing JWT", async () => {
  await withServer(async (port) => {
    const response = await request(port, "/api/v1/issues");
    assert.equal(response.status, 401);
    assert.equal(response.body.message, "Not authorized, no token");
  });
});

test("protected issue route rejects an invalid JWT", async () => {
  await withServer(async (port) => {
    const response = await request(port, "/api/v1/issues", { headers: { Authorization: "Bearer invalid.token.value" } });
    assert.equal(response.status, 401);
    assert.equal(response.body.message, "Invalid or expired token");
  });
});
