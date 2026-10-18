// HTTP server chỉ tồn tại trong thời gian kiểm thử, tự đóng khi kết thúc.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = process.env.ASTRAL_SITE_ROOT || path.resolve(__dirname, '../PC-Astral-Market');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
};
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const target = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!target.startsWith(root + path.sep) || !fs.existsSync(target) || !fs.statSync(target).isFile()) {
    response.writeHead(404);
    response.end();
    return;
  }
  response.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream' });
  fs.createReadStream(target).pipe(response);
});

server.listen(0, '127.0.0.1', () => {
  const testFile = process.argv[2] || 'test_site.cjs';
  const child = spawn(process.execPath, [path.join(__dirname, testFile)], {
    stdio: 'inherit',
    env: { ...process.env, ASTRAL_TEST_URL: 'http://127.0.0.1:' + server.address().port },
  });
  child.on('error', error => {
    console.error(error);
    server.close();
    process.exitCode = 1;
  });
  child.on('exit', code => {
    server.close();
    process.exitCode = code || 0;
  });
});
