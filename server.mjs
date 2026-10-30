import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { projectCaseSEO } from './scripts/project-seo.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'public');
const port = Number(process.env.PORT || 3000);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

const securityHeaders = {
  'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

http.createServer(async (req, res) => {
  for (const [name, value] of Object.entries(securityHeaders)) res.setHeader(name, value);
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Allow': 'GET, HEAD' });
    return res.end();
  }

  let pathname, requestUrl;
  try {
    requestUrl = new URL(req.url, 'http://localhost');
    pathname = decodeURIComponent(requestUrl.pathname);
    if (pathname.includes('\\') || pathname.includes('\0') || pathname.split('/').some(part => part.startsWith('.'))) throw new Error('Invalid path');
  } catch {
    res.writeHead(400);
    return res.end('Requisição inválida');
  }

  if (pathname === '/health') {
    const payload = JSON.stringify({ status: 'ok', service: 'portfolio-public' });
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(req.method === 'HEAD' ? undefined : payload);
  }

  if (['/pt', '/en', '/es'].includes(pathname)) {
    res.writeHead(308, { Location: pathname + '/' });
    return res.end();
  }

  let file = path.resolve(root, '.' + pathname);
  if (!file.startsWith(root + path.sep) && file !== root) {
    res.writeHead(404);
    return res.end();
  }

  try {
    const stat = await fs.stat(file);
    if (stat.isDirectory()) file = path.join(file, 'index.html');
    let bytes = await fs.readFile(file);
    // The HTML body remains client-rendered. The server supplies exact SEO
    // metadata for known cases so link previews do not depend on JavaScript.
    const caseRoute = /^\/(pt|en|es)\/projeto\/?$/.exec(pathname);
    const projectId = requestUrl.searchParams.get('id');
    if (caseRoute && projectId && /^[a-z0-9-]+$/.test(projectId)) {
      const records = JSON.parse(await fs.readFile(path.join(root, 'data/projects.json'), 'utf8'));
      const selected = records.find(item => item.id === projectId);
      if (selected) bytes = Buffer.from(projectCaseSEO(bytes.toString('utf8'), selected, caseRoute[1]));
    }
    const type = mime[path.extname(file).toLowerCase()];
    if (!type) throw new Error('Unsupported file');
    const isData = pathname.startsWith('/data/');
    const isHtml = path.extname(file) === '.html';
    const isCode = ['.css', '.js'].includes(path.extname(file).toLowerCase());
    res.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': type === 'application/pdf' ? 'no-store' : (isData || isHtml || isCode) ? 'no-cache' : 'public, max-age=3600',
    });
    return res.end(req.method === 'HEAD' ? undefined : bytes);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(req.method === 'HEAD' ? undefined : 'Página não encontrada');
  }
}).listen(port, '0.0.0.0', () => {
  console.log(`Portfólio público escutando na porta ${port}`);
});
