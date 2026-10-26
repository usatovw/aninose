// Ставим отобранные глазами кадры «зверь целиком» в основной слой.
// Прежние снимки (макро морды) уже переехали в media-src/closeup и служат
// источником для кропов носа — так нажатие на нос показывает другой кадр.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const COMMONS = JSON.parse(fs.readFileSync('scripts/.media-cache/commons.json', 'utf8'));
const OPENV = JSON.parse(fs.readFileSync('scripts/.media-cache/whole.json', 'utf8'));
const PICKS = JSON.parse(fs.readFileSync('scripts/.media-cache/picks-final.json', 'utf8'));
const META = 'content/photo-meta.json';
const meta = JSON.parse(fs.readFileSync(META, 'utf8'));
const UA = 'aninose/1.0 (children educational project; github.com/usatovw/aninose)';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SRC = 'media-src/whole';
fs.mkdirSync(SRC, { recursive: true });

const log = [];
for (const [id, pick] of Object.entries(PICKS)) {
  const pool = pick.from === 'commons' ? COMMONS[id] : OPENV[id];
  const c = pool?.[pick.i];
  if (!c) { log.push(`${id}: кандидат ${pick.i} пропал`); continue; }
  const raw = `${SRC}/${id}.jpg`;
  if (!fs.existsSync(raw)) {
    try {
      const ac = new AbortController(); const to = setTimeout(() => ac.abort(), 60000);
      const r = await fetch(c.url, { headers: { 'User-Agent': UA }, signal: ac.signal });
      clearTimeout(to);
      if (!r.ok) { log.push(`${id}: не скачалось ${r.status}`); continue; }
      fs.writeFileSync(raw, Buffer.from(await r.arrayBuffer()));
    } catch (e) { log.push(`${id}: ошибка загрузки`); continue; }
    await sleep(300);
  }
  // Квадрат по центру: карточка квадратная, а вырез берётся из того же кадра
  // Квадрат по центру подходит не всегда: у моржа в кадр попадала нога
  // служителя. cx/cy сдвигают окно кропа к самому зверю.
  const cx = pick.cx ?? 0.5, cy = pick.cy ?? 0.5;
  execFileSync('python3', ['-c', `
from PIL import Image
im = Image.open("${raw}").convert("RGB")
s = min(im.size)
l = min(max(int(im.width * ${cx} - s/2), 0), im.width - s)
t = min(max(int(im.height * ${cy} - s/2), 0), im.height - s)
im = im.crop((l, t, l+s, t+s)).resize((900, 900), Image.LANCZOS)
im.save("public/media/photos/${id}.jpg", quality=86, optimize=True)
`]);
  meta[id] = {
    ...(meta[id] || {}),
    file: `${id}.jpg`,
    commons: c.title,
    license: c.license || 'CC',
    author: c.author || c.creator || 'unknown',
    descUrl: c.page || c.url,
    source: pick.from,
    w: 900, h: 900,
    wholeAnimal: true,
  };
  log.push(`${id}: ${c.title.slice(0, 54)} · ${c.license || ''}`);
}
fs.writeFileSync(META, JSON.stringify(meta, null, 1));
console.log(log.join('\n'));
