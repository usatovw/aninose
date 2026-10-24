// Звуки: Openverse (license=cc0, без ключа). Выдача шумная — отсекаем
// произносительные клипы Викисловаря (LL-Q...), музыку и явный мусор.
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'public/media/sounds';
const META = 'content/sound-meta.json';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const animals = JSON.parse(fs.readFileSync('content/animals.json', 'utf8'));
fs.mkdirSync(OUT, { recursive: true });
const meta = fs.existsSync(META) ? JSON.parse(fs.readFileSync(META, 'utf8')) : {};

// Мусор, который реально встречался в выдаче: клипы Викисловаря, звуки двери вместо тюленя, музыка.
const JUNK = /(LL-Q|pronunciation|\bdoor\b|\bmusic\b|\bsong\b|\bremix\b|\bbeat\b|\bloop\b|guitar|piano|drum|\btrap\b|\bvoice\b|spoken)/i;

async function search(q) {
  const u = new URL('https://api.openverse.org/v1/audio/');
  u.search = new URLSearchParams({ q, license: 'cc0', page_size: '20' });
  const r = await fetch(u, { headers: { 'User-Agent': 'aninose/1.0 (kids education)' } });
  if (!r.ok) return [];
  return (await r.json()).results || [];
}

for (const a of animals) {
  if (String(a.sound).startsWith('sfx:')) { console.log('sfx  ', a.id, '-> ElevenLabs'); continue; }
  if (meta[a.id]?.file && fs.existsSync(path.join(OUT, meta[a.id].file))) { console.log('skip ', a.id); continue; }
  try {
    const res = await search(a.sound);
    const good = res
      .filter(r => r.url && !JUNK.test(r.title || ''))
      .filter(r => { const d = r.duration || 0; return d > 400 && d < 9000; })
      // короткие приятнее для малыша: ранжируем по близости к 2 секундам
      .sort((x, y) => Math.abs((x.duration || 0) - 2000) - Math.abs((y.duration || 0) - 2000));
    const pick = good[0];
    if (!pick) { console.log('MISS ', a.id, `(${res.length} raw, all filtered)`); continue; }
    const bin = await fetch(pick.url, { headers: { 'User-Agent': 'aninose/1.0' }, redirect: 'follow' });
    if (!bin.ok) { console.log('DLERR', a.id, bin.status); continue; }
    const ext = (pick.filetype || pick.url.split('.').pop() || 'mp3').replace(/[^a-z0-9]/gi, '').slice(0, 4);
    const file = `${a.id}.${ext}`;
    fs.writeFileSync(path.join(OUT, file), Buffer.from(await bin.arrayBuffer()));
    meta[a.id] = { file, title: pick.title, license: pick.license, creator: pick.creator,
                   source: pick.source, url: pick.foreign_landing_url, duration: pick.duration };
    fs.writeFileSync(META, JSON.stringify(meta, null, 1));
    console.log('ok   ', a.id.padEnd(16), String(pick.title).slice(0, 34), `${((pick.duration||0)/1000).toFixed(1)}s`);
  } catch (e) { console.log('FAIL ', a.id, e.message); }
  await sleep(600);
}
const need = animals.filter(a => !String(a.sound).startsWith('sfx:') && !meta[a.id]);
console.log('\nhave:', Object.keys(meta).length, '| still missing:', need.map(a => a.id).join(', ') || 'none');
