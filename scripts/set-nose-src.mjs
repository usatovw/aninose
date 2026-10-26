// Ставит выбранный кадр источником слоя носа. Аргументы: id:пул:индекс,
// где пул — noses (точечный поиск) или more (категории вида).
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const POOLS = {
  noses: 'scripts/.media-cache/noses.json',
  more: 'scripts/.media-cache/more.json',
};
const META = 'content/photo-meta.json';
const meta = JSON.parse(fs.readFileSync(META, 'utf8'));
const UA = 'aninose/1.0 (children educational project; github.com/usatovw/aninose)';
for (const arg of process.argv.slice(2)) {
  const [id, pool, idx] = arg.split(':');
  const c = JSON.parse(fs.readFileSync(POOLS[pool], 'utf8'))[id]?.[Number(idx)];
  if (!c) { console.log(id, 'нет кандидата'); continue; }
  const r = await fetch(c.url, { headers: { 'User-Agent': UA } });
  if (!r.ok) { console.log(id, 'не скачалось', r.status); continue; }
  const dst = `media-src/closeup/${id}.jpg`;
  fs.writeFileSync(dst, Buffer.from(await r.arrayBuffer()));
  execFileSync('python3', ['-c', `
from PIL import Image, ImageOps
im = ImageOps.exif_transpose(Image.open("${dst}")).convert("RGB")
im.thumbnail((1400, 1400), Image.LANCZOS)
im.save("${dst}", quality=90)`]);
  meta[id] = { ...(meta[id] || {}), noseSource: { commons: c.title, license: c.license,
    author: c.author || 'unknown', descUrl: c.page } };
  console.log(`${id}: ${c.title.slice(0, 58)} · ${c.license} · ${c.author || '—'}`);
}
fs.writeFileSync(META, JSON.stringify(meta, null, 1));
