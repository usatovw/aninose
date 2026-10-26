// Скачивает кандидата звука во временную папку, чтобы проверить его
// метрикой до того, как он попадёт в приложение.
import fs from 'node:fs';
const POOL = JSON.parse(fs.readFileSync('scripts/.media-cache/snd.json', 'utf8'));
const DIR = '/tmp/snd-try';
fs.mkdirSync(DIR, { recursive: true });
for (const arg of process.argv.slice(2)) {
  const [id, idx] = arg.split(':');
  const c = POOL[id]?.[Number(idx)];
  if (!c) { console.log(id, 'нет кандидата', idx); continue; }
  const r = await fetch(c.url, { headers: { 'User-Agent': 'aninose/1.0' }, redirect: 'follow' });
  if (!r.ok) { console.log(id, 'не скачалось', r.status); continue; }
  const f = `${DIR}/${id}-${idx}.mp3`;
  fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
  console.log(`${f}  ${c.title}  [${c.license}] ${c.creator || ''}`);
}
