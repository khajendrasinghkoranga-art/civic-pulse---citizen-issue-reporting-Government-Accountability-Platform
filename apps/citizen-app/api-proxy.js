// Simple reverse-proxy: listens on PORT (default 9000) and forwards
// every request to the backend at http://127.0.0.1:5000
const http = require('http');

const BACKEND = 'http://127.0.0.1:5000';
const PORT = process.env.PROXY_PORT || 9000;

const server = http.createServer((clientReq, clientRes) => {
  // Set CORS headers so the mobile app can call this
  clientRes.setHeader('Access-Control-Allow-Origin', '*');
  clientRes.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
  clientRes.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (clientReq.method === 'OPTIONS') {
    clientRes.writeHead(204);
    clientRes.end();
    return;
  }

  const opts = {
    hostname: '127.0.0.1',
    port: 5000,
    path: clientReq.url,
    method: clientReq.method,
    headers: { ...clientReq.headers, host: '127.0.0.1:5000' },
  };

  const proxyReq = http.request(opts, (proxyRes) => {
    // Copy CORS headers onto proxied response too
    proxyRes.headers['access-control-allow-origin'] = '*';
    clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(clientRes, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    clientRes.writeHead(502);
    clientRes.end(JSON.stringify({ error: 'Backend unreachable' }));
  });

  clientReq.pipe(proxyReq, { end: true });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`API Proxy listening on http://0.0.0.0:${PORT} → ${BACKEND}`);
});
