const { getDefaultConfig } = require('expo/metro-config');
const http = require('http');

const config = getDefaultConfig(__dirname);

// Add custom middleware to proxy /api/v1/* requests to the local backend
config.server = config.server || {};
const originalMiddleware = config.server.enhanceMiddleware;

config.server.enhanceMiddleware = (metroMiddleware, metroServer) => {
  // If there was already an enhanceMiddleware, run it first
  const base = originalMiddleware
    ? originalMiddleware(metroMiddleware, metroServer)
    : metroMiddleware;

  return (req, res, next) => {
    // Intercept requests starting with /api/v1
    if (req.url && req.url.startsWith('/api/v1')) {
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      const opts = {
        hostname: '127.0.0.1',
        port: 5000,
        path: req.url,
        method: req.method,
        headers: { ...req.headers, host: '127.0.0.1:5000' },
      };

      const proxyReq = http.request(opts, (proxyRes) => {
        proxyRes.headers['access-control-allow-origin'] = '*';
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      });

      proxyReq.on('error', (err) => {
        console.error('[API Proxy] Error:', err.message);
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Backend unreachable: ' + err.message }));
      });

      req.pipe(proxyReq, { end: true });
      return;
    }

    // Everything else goes to Metro bundler
    base(req, res, next);
  };
};

module.exports = config;
