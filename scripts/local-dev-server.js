import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createServer as createViteServer } from 'vite';
import theSunChatHandler from '../api/the-sun-chat.js';

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';
const ROOT = resolve(import.meta.dirname, '..');

const loadEnvLocal = () => {
  const envPath = resolve(ROOT, '.env.local');
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const index = trimmed.indexOf('=');
    if (index === -1) return;

    const key = trimmed.slice(0, index).trim();
    const rawValue = trimmed.slice(index + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, '');

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
};

const readJsonBody = async (req) => {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString('utf8');
  if (!rawBody) return {};
  return JSON.parse(rawBody);
};

const createApiResponse = (res) => ({
  setHeader(name, value) {
    res.setHeader(name, value);
  },
  status(code) {
    res.statusCode = code;
    return this;
  },
  json(body) {
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    res.end(JSON.stringify(body));
  },
});

loadEnvLocal();

const vite = await createViteServer({
  root: ROOT,
  server: { middlewareMode: true },
  appType: 'mpa',
});

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${HOST}:${PORT}`);

    if (url.pathname === '/api/the-sun-chat') {
      loadEnvLocal();
      req.body = await readJsonBody(req);
      await theSunChatHandler(req, createApiResponse(res));
      return;
    }

    vite.middlewares(req, res);
  } catch (error) {
    console.error('Local dev server request failed.', {
      name: error.name,
      message: error.message,
    });
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'local_dev_server_error' }));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`THE SUN local dev server: http://${HOST}:${PORT}/sun-chat.html`);
});
