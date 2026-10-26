import fs from 'node:fs';
const C = JSON.parse(fs.readFileSync('scripts/.media-cache/commons.json', 'utf8'));
const DIR = 'scripts/.media-cache/cthumbs';
fs.mkdirSync(DIR, { recursive: true });
const UA = 'aninose/1.0 (children educational project; github.com/usatovw/aninose)';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let got = 0;
for (const [id, list] of Object.entries(C)) {
  for (let i = 0; i < list.length; i++) {
    const f = `${DIR}/${id}-${i}.jpg`;
    if (fs.existsSync(f)) continue;
    try {
      const c = new AbortController(); const to = setTimeout(() => c.abort(), 20000);
      const r = await fetch(list[i].thumb, { headers: { 'User-Agent': UA }, signal: c.signal });
      clearTimeout(to);
      if (r.ok) { fs.writeFileSync(f, Buffer.from(await r.arrayBuffer())); got++; }
    } catch {}
    await sleep(150);
  }
}
console.log('превью Викисклада:', got);
