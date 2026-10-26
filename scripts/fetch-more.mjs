// Больше кандидатов и без сортировки по пропорциям: прошлый отбор
// резал выборку до 8 и терял нормальные кадры.
import fs from 'node:fs';
import { isSafe } from './safety.mjs';
const UA = 'aninose/1.0 (children educational project; github.com/usatovw/aninose)';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const OUT = 'scripts/.media-cache/more.json';
const CATS = JSON.parse(fs.readFileSync('scripts/.media-cache/commons-cats.json', 'utf8'));
const BAD = /dall|midjourney|diffusion|ai.generated|render|3d|illustration|clipart|cartoon|drawing|vector|painting|sketch|engraving|lithograph|statue|figurine|taxiderm|skull|skelet|specimen|plate |icon|coat of arms|stamp|logo|map|diagram|chart|graph|sign|poster|book|cover|label|dead|carcass|roadkill|hunt|trap/i;

async function api(params, base = 'https://commons.wikimedia.org/w/api.php') {
  const u = new URL(base);
  u.search = new URLSearchParams({ ...params, format: 'json', origin: '*' });
  for (let t = 0; t < 3; t++) {
    try {
      const c = new AbortController(); const to = setTimeout(() => c.abort(), 30000);
      const r = await fetch(u, { headers: { 'User-Agent': UA }, signal: c.signal });
      clearTimeout(to);
      if (r.ok) return await r.json();
    } catch {}
    await sleep(2000);
  }
  return null;
}

const ids = process.argv.slice(2);
const out = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
for (const id of ids) {
  const cat = CATS[id];
  if (!cat) { console.log(id, 'нет категории'); continue; }
  const seen = new Set(); const list = [];
  const pull = async title => {
    const m = await api({ action: 'query', generator: 'categorymembers', gcmtitle: title,
      gcmtype: 'file', gcmlimit: '100', prop: 'imageinfo',
      iiprop: 'url|size|extmetadata', iiurlwidth: '420' });
    for (const p of Object.values(m?.query?.pages || {})) {
      const ii = p.imageinfo?.[0]; if (!ii) continue;
      const t = (p.title || '').replace(/^File:/, '');
      if (!/\.(jpe?g|png)$/i.test(t) || seen.has(t)) continue;
      seen.add(t);
      if (!isSafe(t) || BAD.test(t)) continue;
      if ((ii.width || 0) < 900 || (ii.height || 0) < 650) continue;
      const em = ii.extmetadata || {};
      list.push({ title: t, url: ii.url.split('?')[0], thumb: ii.thumburl || ii.url,
        w: ii.width, h: ii.height,
        license: (em.LicenseShortName?.value || '').replace(/<[^>]+>/g, ''),
        author: (em.Artist?.value || '').replace(/<[^>]+>/g, '').trim().slice(0, 90),
        page: ii.descriptionurl, source: 'commons' });
    }
  };
  await pull(`Category:${cat}`);
  const sub = await api({ action: 'query', list: 'categorymembers',
    cmtitle: `Category:${cat}`, cmtype: 'subcat', cmlimit: '30' });
  for (const c of sub?.query?.categorymembers || []) {
    if (BAD.test(c.title) || /sound|audio|video|anatom|museum|art|coin/i.test(c.title)) continue;
    await pull(c.title); await sleep(350);
    if (list.length >= 60) break;
  }
  out[id] = list.slice(0, 48);
  console.log(id.padEnd(16), cat.slice(0, 26).padEnd(28), out[id].length);
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
  await sleep(500);
}
