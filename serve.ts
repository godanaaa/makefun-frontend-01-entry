import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('./app/', import.meta.url)));
const portAt = process.argv.indexOf('--port');
const port = Number(portAt >= 0 ? process.argv[portAt + 1] : 8080);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };

createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname); }
  catch { response.writeHead(400).end('Bad request'); return; }
  const target = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
  if (target !== root && !target.startsWith(`${root}${sep}`)) { response.writeHead(403).end('Forbidden'); return; }
  try {
    if (!statSync(target).isFile()) throw new Error('Not a file');
    response.writeHead(200, { 'Content-Type': types[extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    createReadStream(target).pipe(response);
  } catch { response.writeHead(404).end('Not found'); }
}).listen(port, 'localhost', () => process.stdout.write(`makefun app at http://localhost:${port}\n`));
