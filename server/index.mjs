// Отдаёт собранный SPA и хранит альбом наклеек.
// Прогресс намеренно простой: один файл на диске. Это семейный сайт на одного ребёнка,
// база данных здесь была бы лишней движущейся частью.
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', 'dist');
// Container Apps запускает контейнер от UID 1000: писать в /app нельзя.
const DATA = process.env.DATA_DIR || '/tmp/aninose-data';
const FILE = path.join(DATA, 'progress.json');
let canWrite = true;
try { fs.mkdirSync(DATA, { recursive: true }); }
catch { canWrite = false; }   // прогресс останется только в памяти и в localStorage у клиента

const app = Fastify({ logger: { level: process.env.LOG_LEVEL || 'info' } });

let mem = null;
const read = () => { if (mem) return mem;
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return { ids: [] }; } };
const write = d => { mem = d; if (!canWrite) return;
  try { fs.writeFileSync(FILE, JSON.stringify(d)); } catch (e) { app.log.warn(e.message); } };

await app.register(fastifyStatic, { root: ROOT, index: false });

app.get('/api/health', async () => ({ ok: true }));

app.get('/api/content', async () => ({
  animals: JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'content', 'animals.json'), 'utf8')),
  types:   JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'content', 'nose-types.json'), 'utf8')),
}));

app.get('/api/progress', async () => read());

app.post('/api/progress', async (req, reply) => {
  const id = String(req.body?.id || '').slice(0, 64);
  if (!/^[a-z]+$/.test(id)) return reply.code(400).send({ error: 'bad id' });
  const d = read();
  if (!d.ids.includes(id)) { d.ids.push(id); write(d); }
  return d;
});

// SPA: любой неизвестный путь отдаём index.html, чтобы работали прямые ссылки
app.setNotFoundHandler((req, reply) => {
  if (req.raw.url?.startsWith('/api/')) return reply.code(404).send({ error: 'not found' });
  return reply.type('text/html').send(fs.readFileSync(path.join(ROOT, 'index.html')));
});

const port = Number(process.env.PORT || 8080);
await app.listen({ port, host: '0.0.0.0' });
app.log.info(`aninose on :${port}`);
