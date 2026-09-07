const http = require("node:http");

const startServer = async (app) => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  return { server, port: server.address().port };
};

const stopServer = (server) => new Promise((resolve) => server.close(resolve));

const request = (port, path, { method = "GET", headers = {}, body } = {}) => new Promise((resolve, reject) => {
  const rawBody = body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body);
  const req = http.request({
    host: "127.0.0.1",
    port,
    path,
    method,
    headers: {
      ...(rawBody === undefined ? {} : { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(rawBody) }),
      ...headers,
    },
  }, (res) => {
    let rawResponse = "";
    res.on("data", (chunk) => { rawResponse += chunk; });
    res.on("end", () => {
      let responseBody = rawResponse;
      try { responseBody = JSON.parse(rawResponse); } catch (_) { /* Keep non-JSON output for assertions. */ }
      resolve({ status: res.statusCode, body: responseBody });
    });
  });
  req.on("error", reject);
  if (rawBody !== undefined) req.write(rawBody);
  req.end();
});

module.exports = { startServer, stopServer, request };
