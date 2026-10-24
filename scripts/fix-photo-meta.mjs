// Чинит имена файлов (в них попадала ?utm_source=...) и добирает лицензии
// батчами по 40 titles за запрос — вместо 53 отдельных вызовов (rate limit).
import fs from 'node:fs';
const UA = 'aninose/1.0 (children educational project; https://github.com/usatovw/aninose)';
const META = 'content/photo-meta.json';
const meta = JSON.parse(fs.readFileSync(META, 'utf8'));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const strip = h => (h || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

for (const [id, m] of Object.entries(meta)) m.commons = decodeURIComponent(m.commons.split('?')[0]);

const ids = Object.keys(meta);
for (let i = 0; i < ids.length; i += 40) {
  const chunk = ids.slice(i, i + 40);
  const titles = chunk.map(id => 'File:' + meta[id].commons).join('|');
  const u = new URL('https://commons.wikimedia.org/w/api.php');
  u.search = new URLSearchParams({ action: 'query', format: 'json', titles,
    prop: 'imageinfo', iiprop: 'url|extmetadata' });
  let data = null;
  for (let t = 0; t < 6; t++) {
    const r = await fetch(u, { headers: { 'User-Agent': UA } });
    if (r.status === 429) { await sleep(8000 * (t + 1)); continue; }
    data = await r.json(); break;
  }
  if (!data) { console.log('batch failed'); continue; }
  const byTitle = {};
  for (const p of Object.values(data.query?.pages || {})) byTitle[p.title.replace(/_/g,' ')] = p;
  for (const id of chunk) {
    const p = byTitle['File:' + meta[id].commons.replace(/_/g, ' ')];
    const em = p?.imageinfo?.[0]?.extmetadata;
    if (!em) { console.log('no meta:', id, meta[id].commons); continue; }
    meta[id].license = strip(em.LicenseShortName?.value) || 'unknown';
    meta[id].author  = strip(em.Artist?.value) || 'unknown';
    meta[id].descUrl = p.imageinfo[0].descriptionurl;
    meta[id].attributionRequired = !/public domain|^cc0/i.test(meta[id].license);
  }
  console.log('batch', i / 40 + 1, 'done');
  await sleep(3000);
}
fs.writeFileSync(META, JSON.stringify(meta, null, 1));
const unk = Object.entries(meta).filter(([, m]) => m.license === 'unknown').map(([k]) => k);
console.log('unknown left:', unk.length ? unk.join(', ') : 'none');
