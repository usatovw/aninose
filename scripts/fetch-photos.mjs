// Тянет заглавное фото каждого вида из Wikipedia (выбрано редакторами -> вид точно тот),
// затем забирает лицензию и автора с Викисклада. Последовательно, с паузой: у Wikimedia жёсткий rate limit.
import fs from 'node:fs';
import path from 'node:path';

const UA = 'aninose/1.0 (children educational project; https://github.com/usatovw/aninose)';
const OUT = 'public/media/photos';
const META = 'content/photo-meta.json';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const animals = JSON.parse(fs.readFileSync('content/animals.json', 'utf8'));
fs.mkdirSync(OUT, { recursive: true });
const meta = fs.existsSync(META) ? JSON.parse(fs.readFileSync(META, 'utf8')) : {};

async function getJSON(url) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (r.status === 429) { await sleep(5000 * (attempt + 1)); continue; }
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return r.json();
  }
  throw new Error('rate limited: ' + url);
}

const strip = h => (h || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

for (const a of animals) {
  if (meta[a.id]?.file && fs.existsSync(path.join(OUT, meta[a.id].file))) {
    console.log('skip (cached)', a.id); continue;
  }
  try {
    const s = await getJSON('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(a.wiki));
    const img = s.originalimage?.source || s.thumbnail?.source;
    if (!img) { console.log('NO IMAGE', a.id); continue; }
    const commonsName = decodeURIComponent(img.split('/').pop().replace(/^\d+px-/, ''));
    await sleep(1200);

    const q = new URL('https://commons.wikimedia.org/w/api.php');
    q.search = new URLSearchParams({
      action: 'query', format: 'json', titles: 'File:' + commonsName,
      prop: 'imageinfo', iiprop: 'url|extmetadata|mime', iiurlwidth: '1200',
    });
    const c = await getJSON(q);
    const page = Object.values(c.query?.pages || {})[0] || {};
    const ii = page.imageinfo?.[0] || {};
    const em = ii.extmetadata || {};
    const dl = ii.thumburl || ii.url || img;

    const ext = (dl.split('?')[0].match(/\.(jpe?g|png|webp)$/i)?.[1] || 'jpg').toLowerCase();
    const file = `${a.id}.${ext === 'jpeg' ? 'jpg' : ext}`;
    const bin = await fetch(dl, { headers: { 'User-Agent': UA } });
    if (!bin.ok) throw new Error('download ' + bin.status);
    fs.writeFileSync(path.join(OUT, file), Buffer.from(await bin.arrayBuffer()));

    meta[a.id] = {
      file,
      commons: commonsName,
      license: strip(em.LicenseShortName?.value) || 'unknown',
      author: strip(em.Artist?.value) || 'unknown',
      descUrl: ii.descriptionurl || s.content_urls?.desktop?.page,
      wikipedia: s.content_urls?.desktop?.page,
    };
    fs.writeFileSync(META, JSON.stringify(meta, null, 1));
    console.log('ok', a.id.padEnd(16), meta[a.id].license);
  } catch (e) {
    console.log('FAIL', a.id, e.message);
  }
  await sleep(1500);
}
console.log('\ndone:', Object.keys(meta).length, '/', animals.length);
