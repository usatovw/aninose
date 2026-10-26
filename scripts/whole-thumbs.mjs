// Качаем превью кандидатов, чтобы отбирать кадр «зверь целиком» глазами.
// Автоматический отбор по заголовку уже один раз подсунул тюленю фотографию
// человека — поэтому решение принимается только по картинке.
import fs from 'node:fs';
const CAND = JSON.parse(fs.readFileSync('scripts/.media-cache/whole.json', 'utf8'));
const DIR = 'scripts/.media-cache/thumbs';
fs.mkdirSync(DIR, { recursive: true });
const UA = 'aninose/1.0 (children educational project; github.com/usatovw/aninose)';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let got = 0, skip = 0;
for (const [id, list] of Object.entries(CAND)) {
  for (let i = 0; i < list.length; i++) {
    const f = `${DIR}/${id}-${i}.jpg`;
    if (fs.existsSync(f)) { skip++; continue; }
    try {
      const c = new AbortController(); const to = setTimeout(() => c.abort(), 20000);
      const r = await fetch(list[i].thumb, { headers: { 'User-Agent': UA }, signal: c.signal });
      clearTimeout(to);
      if (r.ok) { fs.writeFileSync(f, Buffer.from(await r.arrayBuffer())); got++; }
    } catch { /* пропускаем: кандидатов с запасом */ }
    await sleep(120);
  }
}
console.log(`превью: скачано ${got}, уже было ${skip}`);
