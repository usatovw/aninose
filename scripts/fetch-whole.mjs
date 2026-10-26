// Кандидаты на кадр «зверь целиком». Главная претензия Владимира: на карточке
// макро носа, а не зверь, и при нажатии «нос» показывается то же самое фото.
// Значит основному слою нужен отдельный снимок, где животное видно полностью.
// Скрипт только собирает кандидатов — выбор делается глазами по раскладке.
import fs from 'node:fs';
import { isSafe } from './safety.mjs';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const UA = 'aninose/1.0 (children educational project; github.com/usatovw/aninose)';
const animals = JSON.parse(fs.readFileSync('content/animals.json', 'utf8'));
const OUT = 'scripts/.media-cache/whole.json';

// Слова, которые тянут кадр к «зверю целиком», и слова макро-плана — их штрафуем
const WHOLE = /(full body|whole|standing|walking|running|grazing|herd|wild|in the|at the|zoo|savanna|field|meadow|forest|swimming)/i;
const CLOSE = /(close|macro|closeup|close-up|detail|nostril|muzzle shot|eye)/i;
const AI = /dall|midjourney|stable.?diffusion|ai.generated|generated|render|3d |illustration|clipart|cartoon|drawing|vector|painting|sketch/i;

async function search(q, page = 1) {
  const u = new URL('https://api.openverse.org/v1/images/');
  u.search = new URLSearchParams({ q, license: 'cc0,by,by-sa', page_size: '20',
                                   page: String(page), mature: 'false' });
  for (let t = 0; t < 4; t++) {
    try {
      const c = new AbortController(); const to = setTimeout(() => c.abort(), 25000);
      const r = await fetch(u, { headers: { 'User-Agent': UA }, signal: c.signal });
      clearTimeout(to);
      if (r.status === 429) { await sleep(6000 * (t + 1)); continue; }
      if (!r.ok) return [];
      return (await r.json()).results || [];
    } catch { await sleep(3000); }
  }
  return [];
}

const out = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
for (const a of animals) {
  if (out[a.id]?.length >= 6) { console.log(a.id.padEnd(16), 'уже есть'); continue; }
  const sp = a.wiki.replace(/_/g, ' ');
  const queries = [`${sp} full body`, `${sp} standing`, `${sp} whole animal`, sp];
  const seen = new Set(); const cands = [];
  for (const q of queries) {
    for (const r of await search(q)) {
      const title = r.title || '';
      if (!r.url || seen.has(r.url)) continue;
      seen.add(r.url);
      if (!isSafe(title) || AI.test(title)) continue;
      const w = r.width || 0, h = r.height || 0;
      if (w < 800 || h < 600) continue;
      cands.push({ title, url: r.url, thumb: r.thumbnail || r.url, w, h,
        license: r.license, lv: r.license_version, creator: r.creator,
        source: r.source, page: r.foreign_landing_url,
        score: (WHOLE.test(title) ? 3 : 0) - (CLOSE.test(title) ? 3 : 0)
             + (w >= 1600 ? 1 : 0) + (w > h ? 1 : 0) });
    }
    await sleep(900);
  }
  cands.sort((x, y) => y.score - x.score || y.w - x.w);
  out[a.id] = cands.slice(0, 8);
  console.log(a.id.padEnd(16), out[a.id].length);
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
}
console.log('готово');
