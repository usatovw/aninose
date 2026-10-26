// Ставим отдельный близкий кадр как источник слоя носа.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const N = JSON.parse(fs.readFileSync('scripts/.media-cache/noses.json', 'utf8'));
const META = 'content/photo-meta.json';
const meta = JSON.parse(fs.readFileSync(META, 'utf8'));
const UA = 'aninose/1.0 (children educational project; github.com/usatovw/aninose)';
for (const arg of process.argv.slice(2)) {
  const [id, idx] = arg.split(':');
  const c = N[id]?.[Number(idx)];
  if (!c) { console.log(id, 'нет кандидата'); continue; }
  const r = await fetch(c.url, { headers: { 'User-Agent': UA } });
  if (!r.ok) { console.log(id, 'не скачалось', r.status); continue; }
  const raw = `media-src/closeup/${id}.jpg`;
  fs.writeFileSync(raw, Buffer.from(await r.arrayBuffer()));
  execFileSync('python3', ['-c', `
from PIL import Image, ImageOps
im = ImageOps.exif_transpose(Image.open("${raw}")).convert("RGB")
im.thumbnail((1400, 1400), Image.LANCZOS)
im.save("${raw}", quality=90)`]);
  meta[id] = { ...(meta[id] || {}), noseSource: { commons: c.title, license: c.license,
    author: c.author || 'unknown', descUrl: c.page } };
  console.log(`${id}: ${c.title.slice(0, 56)} · ${c.license} · ${c.author || '—'}`);
}
fs.writeFileSync(META, JSON.stringify(meta, null, 1));
