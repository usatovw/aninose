// Ставим кадр из расширенной выборки Викисклада.
// Аргументы: id:индекс[:cx[:cy]]
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const POOLS = {
  more: JSON.parse(fs.readFileSync('scripts/.media-cache/more.json', 'utf8')),
  noses: fs.existsSync('scripts/.media-cache/noses.json')
    ? JSON.parse(fs.readFileSync('scripts/.media-cache/noses.json', 'utf8')) : {},
};
const META = 'content/photo-meta.json';
const meta = JSON.parse(fs.readFileSync(META, 'utf8'));
const UA = 'aninose/1.0 (children educational project; github.com/usatovw/aninose)';
fs.mkdirSync('media-src/whole', { recursive: true });

for (const arg of process.argv.slice(2)) {
  // id:индекс[:cx:cy] — из категорий вида; id@noses:индекс — из точечного поиска
  const [rawId, idx, cx = '0.5', cy = '0.5'] = arg.split(':');
  const [id, pool = 'more'] = rawId.split('@');
  const c = POOLS[pool]?.[id]?.[Number(idx)];
  if (!c) { console.log(id, 'нет кандидата', idx); continue; }
  const raw = `media-src/whole/${id}.jpg`;
  const ac = new AbortController(); const to = setTimeout(() => ac.abort(), 90000);
  const r = await fetch(c.url, { headers: { 'User-Agent': UA }, signal: ac.signal });
  clearTimeout(to);
  if (!r.ok) { console.log(id, 'не скачалось', r.status); continue; }
  fs.writeFileSync(raw, Buffer.from(await r.arrayBuffer()));
  // Квадрат центрируем не по кадру, а по самому зверю: rembg даёт маску
  // объекта, по её середине и режем. Иначе у лошади в кадр попадал круп,
  // а голова оставалась за краем.
  execFileSync('python3', ['-c', `
import os
os.environ.setdefault('U2NET_HOME', '/root/.u2net')
from PIL import Image, ImageOps
import numpy as np
# без учёта EXIF корова приезжала лежащей на боку
im = ImageOps.exif_transpose(Image.open("${raw}")).convert("RGB")
cx, cy = ${cx}, ${cy}
if ${cx} == 0.5 and ${cy} == 0.5:
    try:
        from rembg import remove, new_session
        small = im.copy(); small.thumbnail((640, 640))
        a = np.array(remove(small, session=new_session('u2net')).getchannel('A')) > 120
        if a.sum() > small.width * small.height * 0.02:
            ys, xs = np.where(a)
            cx = ((xs.min() + xs.max()) / 2) / small.width
            cy = ((ys.min() + ys.max()) / 2) / small.height
    except Exception:
        pass
s = min(im.size)
l = min(max(int(im.width * cx - s/2), 0), im.width - s)
t = min(max(int(im.height * cy - s/2), 0), im.height - s)
im.crop((l, t, l+s, t+s)).resize((900, 900), Image.LANCZOS).save(
    "public/media/photos/${id}.jpg", quality=86, optimize=True)
`]);
  meta[id] = { ...(meta[id] || {}), file: `${id}.jpg`, commons: c.title,
    license: c.license || 'CC', author: c.author || 'unknown',
    descUrl: c.page, source: 'commons', w: 900, h: 900, wholeAnimal: true };
  console.log(`${id}: ${c.title.slice(0, 60)} · ${c.license} · ${c.author || '—'}`);
}
fs.writeFileSync(META, JSON.stringify(meta, null, 1));
