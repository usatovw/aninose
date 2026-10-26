// Поиск замены для звуков, которые пугают или звучат неправдоподобно.
// Ребёнок испугался ежа: файл назывался «Angry hedgehog huffing snorting»,
// 6 секунд злого фырканья. Слова испуга теперь отсекаются жёстко.
import fs from 'node:fs';
const SCARY = /(angry|aggress|attack|growl|snarl|scream|screech|roar|hiss|fight|distress|alarm|warning|pain|kill|hunt|shot|gun|horror|scary|monster)/i;
const JUNK = /(LL-Q|pronunciation|\bdoor\b|\bmusic\b|\bsong\b|\bremix\b|\bbeat\b|\bloop\b|guitar|piano|drum|synth|\bvoice\b|spoken|human|man |woman)/i;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function search(q) {
  const u = new URL('https://api.openverse.org/v1/audio/');
  u.search = new URLSearchParams({ q, license: 'cc0', page_size: '40' });
  for (let t = 0; t < 3; t++) {
    try {
      const r = await fetch(u, { headers: { 'User-Agent': 'aninose/1.0 (kids education)' } });
      if (r.ok) return (await r.json()).results || [];
      console.log('ответ', r.status);
    } catch (e) { console.log('сеть:', e.message); }
    await sleep(2000);
  }
  return [];
}

for (const arg of process.argv.slice(2)) {
  const [id, ...q] = arg.split('|');
  const res = await search(q.join(' '));
  const good = res
    .filter(r => r.url && !JUNK.test(r.title || '') && !SCARY.test(r.title || ''))
    .filter(r => { const d = r.duration || 0; return d > 500 && d < 6000; })
    .sort((x, y) => Math.abs((x.duration || 0) - 2200) - Math.abs((y.duration || 0) - 2200));
  console.log(`\n== ${id}: «${q.join(' ')}» — подошло ${good.length} из ${res.length}`);
  good.slice(0, 12).forEach((r, i) =>
    console.log(`  ${i}  ${String(Math.round((r.duration || 0) / 100) / 10).padStart(4)}с  ${(r.title || '').slice(0, 58)}  [${r.license}] ${r.creator || ''}`));
  fs.mkdirSync('scripts/.media-cache', { recursive: true });
  const all = fs.existsSync('scripts/.media-cache/snd.json')
    ? JSON.parse(fs.readFileSync('scripts/.media-cache/snd.json', 'utf8')) : {};
  all[id] = good.slice(0, 12);
  fs.writeFileSync('scripts/.media-cache/snd.json', JSON.stringify(all, null, 1));
  await sleep(900);
}
