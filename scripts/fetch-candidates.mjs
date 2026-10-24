// Ищет на Викискладе крупные планы головы/морды для каждого вида.
// Заглавные фото Wikipedia не годятся: общие планы и коллажи.
import fs from 'node:fs';
const UA = 'aninose/1.0 (children educational project; https://github.com/usatovw/aninose)';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const animals = JSON.parse(fs.readFileSync('content/animals.json', 'utf8'));
const OUT = 'scripts/.media-cache/cand';
fs.mkdirSync(OUT, { recursive: true });

// Коллажи/схемы/мусор, который реально лезет в выдачу.
const JUNK = /(montage|collage|composite|diagram|map|skull|skeleton|stamp|coin|logo|chart|icon|sign|statue|painting|drawing|illustration|museum|specimen|taxidermy|fossil|plate|engraving|coat of arms|\.svg|\.pdf|\.tif)/i;
const GOOD = /(head|face|portrait|muzzle|snout|nose|closeup|close.up|detail)/i;

const extra = { dog:'dog', cat:'cat', fish:'fish head', seal:'seal head', monkey:'monkey', whale:'whale head', mole:'mole', mouse:'mouse', bee:'bee', snail:'snail' };

async function search(q, limit = 14) {
  const u = new URL('https://commons.wikimedia.org/w/api.php');
  u.search = new URLSearchParams({ action:'query', format:'json', generator:'search',
    gsrnamespace:'6', gsrlimit:String(limit), gsrsearch:q,
    prop:'imageinfo', iiprop:'url|extmetadata|mime|size', iiurlwidth:'320' });
  for (let t = 0; t < 6; t++) {
    const r = await fetch(u, { headers: { 'User-Agent': UA } });
    if (r.status === 429) { await sleep(7000 * (t + 1)); continue; }
    if (!r.ok) return [];
    const d = await r.json();
    return Object.values(d.query?.pages || {});
  }
  return [];
}

const all = {};
for (const a of animals) {
  const base = extra[a.id] || a.wiki;
  const pages = [...await search(`${base} head close up`), ...(await (sleep(1400), search(`${base} face portrait`, 10)))];
  const seen = new Set();
  const cands = [];
  for (const p of pages) {
    const ii = p.imageinfo?.[0]; if (!ii || !/^image\/(jpeg|png)/.test(ii.mime || '')) continue;
    if (JUNK.test(p.title)) continue;
    if (seen.has(p.title)) continue; seen.add(p.title);
    if ((ii.width || 0) < 500) continue;
    cands.push({ title: p.title, thumb: ii.thumburl, url: ii.url, w: ii.width, h: ii.height,
      score: (GOOD.test(p.title) ? 2 : 0) + (ii.height >= ii.width ? 1 : 0),
      license: (ii.extmetadata?.LicenseShortName?.value || '').replace(/<[^>]*>/g,''),
      author: (ii.extmetadata?.Artist?.value || '').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim(),
      descUrl: ii.descriptionurl });
  }
  cands.sort((x, y) => y.score - x.score);
  all[a.id] = cands.slice(0, 6);
  console.log(a.id.padEnd(16), all[a.id].length);
  fs.writeFileSync('scripts/.media-cache/candidates.json', JSON.stringify(all, null, 1));
  await sleep(1500);
}
