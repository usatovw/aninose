// Openverse по запросу «full body» отдаёт гравюры, интерьеры и чучела.
// Викисклад хранит файлы в категориях по видам — подборка куратора, а не поиск
// по словам. Берём категорию вида через Wikidata (свойство P373) и тянем из неё.
import fs from 'node:fs';
import { isSafe } from './safety.mjs';

const UA = 'aninose/1.0 (children educational project; github.com/usatovw/aninose)';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const animals = JSON.parse(fs.readFileSync('content/animals.json', 'utf8'));
const OUT = 'scripts/.media-cache/commons.json';
const CATS = 'scripts/.media-cache/commons-cats.json';

const AI = /dall|midjourney|diffusion|ai.generated|render|3d|illustration|clipart|cartoon|drawing|vector|painting|sketch|engraving|lithograph|statue|figurine|museum|taxiderm|mount|skull|skeleton|specimen|plate |icon|coat of arms|stamp|logo|map|diagram/i;

async function api(base, params) {
  const u = new URL(base);
  u.search = new URLSearchParams({ ...params, format: 'json', origin: '*' });
  for (let t = 0; t < 3; t++) {
    try {
      const c = new AbortController(); const to = setTimeout(() => c.abort(), 25000);
      const r = await fetch(u, { headers: { 'User-Agent': UA }, signal: c.signal });
      clearTimeout(to);
      if (r.ok) return await r.json();
    } catch { /* повторим */ }
    await sleep(2000);
  }
  return null;
}

/** Статья в Википедии → элемент Wikidata → категория Викисклада */
async function commonsCat(wiki) {
  const j = await api('https://en.wikipedia.org/w/api.php',
    { action: 'query', prop: 'pageprops', titles: wiki.replace(/_/g, ' ') });
  const page = Object.values(j?.query?.pages || {})[0];
  const qid = page?.pageprops?.wikibase_item;
  if (!qid) return null;
  const w = await api('https://www.wikidata.org/w/api.php',
    { action: 'wbgetclaims', entity: qid, property: 'P373' });
  const p373 = w?.claims?.P373?.[0]?.mainsnak?.datavalue?.value;
  if (p373) return p373;
  // У части видов свойства P373 нет. Тогда берём ссылку на Викисклад
  // из самого элемента, а в последнюю очередь — заголовок статьи.
  const e = await api('https://www.wikidata.org/w/api.php',
    { action: 'wbgetentities', ids: qid, props: 'sitelinks' });
  const link = e?.entities?.[qid]?.sitelinks?.commonswiki?.title;
  if (link) return link.replace(/^Category:/, '');
  return wiki.replace(/_/g, ' ');
}

const cats = fs.existsSync(CATS) ? JSON.parse(fs.readFileSync(CATS, 'utf8')) : {};
const out = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};

for (const a of animals) {
  if (out[a.id]?.length) { console.log(a.id.padEnd(16), 'уже есть'); continue; }
  if (!(a.id in cats)) {
    cats[a.id] = await commonsCat(a.wiki);
    fs.writeFileSync(CATS, JSON.stringify(cats, null, 1));
    await sleep(400);
  }
  if (!cats[a.id]) { console.log(a.id.padEnd(16), 'категория не найдена'); out[a.id] = []; continue; }

  const filesOf = async cat => {
    const m = await api('https://commons.wikimedia.org/w/api.php', {
      action: 'query', generator: 'categorymembers', gcmtitle: cat,
      gcmtype: 'file', gcmlimit: '60', prop: 'imageinfo',
      iiprop: 'url|size|extmetadata', iiurlwidth: '420',
    });
    return Object.values(m?.query?.pages || {});
  };
  let pages = await filesOf(`Category:${cats[a.id]}`);
  // У многих видов файлы разложены по подкатегориям, а в самой категории пусто —
  // тогда заглядываем на уровень ниже.
  if (pages.length < 6) {
    const sub = await api('https://commons.wikimedia.org/w/api.php', {
      action: 'query', list: 'categorymembers', cmtitle: `Category:${cats[a.id]}`,
      cmtype: 'subcat', cmlimit: '12',
    });
    for (const c of (sub?.query?.categorymembers || []).slice(0, 6)) {
      if (/sound|audio|video|skull|skelet|bone|anatom|hunt|taxiderm|museum|art|stamp|coin|logo/i.test(c.title)) continue;
      pages = pages.concat(await filesOf(c.title));
      await sleep(400);
      if (pages.length >= 24) break;
    }
  }
  const list = [];
  for (const p of pages) {
    const ii = p.imageinfo?.[0]; if (!ii) continue;
    const title = (p.title || '').replace(/^File:/, '');
    if (!/\.(jpe?g|png)$/i.test(title)) continue;
    if (!isSafe(title) || AI.test(title)) continue;
    if ((ii.width || 0) < 900 || (ii.height || 0) < 650) continue;
    const em = ii.extmetadata || {};
    list.push({ title, url: ii.url, thumb: ii.thumburl || ii.url,
      w: ii.width, h: ii.height,
      license: (em.LicenseShortName?.value || '').replace(/<[^>]+>/g, ''),
      author: (em.Artist?.value || '').replace(/<[^>]+>/g, '').trim().slice(0, 90),
      page: ii.descriptionurl, source: 'commons' });
  }
  // широкий кадр чаще показывает зверя целиком, макро обычно вертикальное
  list.sort((x, y) => (y.w / y.h) - (x.w / x.h));
  out[a.id] = list.slice(0, 8);
  console.log(a.id.padEnd(16), cats[a.id]?.slice(0, 28).padEnd(30), out[a.id].length);
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
  await sleep(600);
}
console.log('готово');
