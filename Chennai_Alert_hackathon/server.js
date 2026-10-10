const http = require('http');
const fs = require('fs');
const path = require('path');
const { handler } = require('./netlify/functions/reports.js');

const root = __dirname;
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json' };

function api(req, res, pathname) {
  let body = '';
  const eventPath = pathname.startsWith('/api/')
    ? pathname.replace('/api', '')
    : pathname.replace('/.netlify/functions', '');
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    const event = {
      httpMethod: req.method,
      path: eventPath,
      body,
      headers: req.headers,
      queryStringParameters: Object.fromEntries(new URL(req.url, 'http://localhost').searchParams)
    };
    const out = await handler(event);
    res.writeHead(out.statusCode || 200, out.headers || {});
    res.end(out.body || '');
  });
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/.netlify/functions/') || url.pathname.startsWith('/api/')) {
    return api(req, res, url.pathname);
  }

  const requested = url.pathname === '/' ? '/index.html' :
    url.pathname === '/admin/' ? '/admin/index.html' : url.pathname;
  const file = path.join(root, requested);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); return res.end('Not found');
  }
  res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'text/plain' });
  fs.createReadStream(file).pipe(res);
}).listen(process.env.PORT || 3000, '0.0.0.0');
