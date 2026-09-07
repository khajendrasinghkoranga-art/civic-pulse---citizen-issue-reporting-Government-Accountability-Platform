const test = require("node:test");
const assert = require("node:assert/strict");
require("./helpers/test-environment");
const { startServer, stopServer, request } = require("./helpers/http");

const app = require("../src/app");

const withServer = async (callback) => {
  const { server, port } = await startServer(app);
  try { await callback(port); } finally { await stopServer(server); }
};

test("GET /health returns a successful health response", async () => {
  await withServer(async (port) => {
    const response = await request(port, "/health");
    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.status, "healthy");
  });
});

test("unknown routes return a JSON 404", async () => {
  await withServer(async (port) => {
    const response = await request(port, "/api/v1/not-a-route");
    assert.equal(response.status, 404);
    assert.equal(response.body.success, false);
  });
});
