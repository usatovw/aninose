// Проверка озвучки слухом невозможна в этой среде, поэтому проверяем машинно:
// прогоняем каждый файл через распознавание речи и сравниваем с исходным текстом.
// Расхождение — признак того, что синтез слово переврал.
import fs from 'node:fs';

const KEY = (fs.readFileSync('.env', 'utf8').match(/ELEVENLABS_API_KEY=(.+)/) || [])[1]?.trim();
const map = JSON.parse(fs.readFileSync('content/voice-map.json', 'utf8'));
const OUT = 'content/voice-check.json';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                   .toLowerCase().replace(/ё/g, 'е').replace(/[^а-я0-9 ]/gi, ' ')
                   .replace(/\s+/g, ' ').trim();

// расстояние Левенштейна по словам: одна-две мелочи пунктуации нас не волнуют
function wordDiff(a, b) {
  const A = norm(a).split(' '), B = norm(b).split(' ');
  const d = Array.from({ length: A.length + 1 }, (_, i) =>
    Array.from({ length: B.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= A.length; i++)
    for (let j = 1; j <= B.length; j++)
      d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + (A[i-1] === B[j-1] ? 0 : 1));
  return { dist: d[A.length][B.length], words: A.length,
           missing: A.filter(w => !B.includes(w)), extra: B.filter(w => !A.includes(w)) };
}

const res = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
const keys = Object.keys(map);
for (const key of keys) {
  if (res[key]) continue;
  const f = `public/media/voice/${key}.mp3`;
  if (!fs.existsSync(f)) continue;
  const fd = new FormData();
  fd.append('model_id', 'scribe_v1');
  fd.append('language_code', 'rus');
  fd.append('file', new Blob([fs.readFileSync(f)]), `${key}.mp3`);
  let heard = null;
  for (let t = 0; t < 3 && heard === null; t++) {
    try {
      const r = await fetch('https://api.elevenlabs.io/v1/speech-to-text',
                            { method: 'POST', headers: { 'xi-api-key': KEY }, body: fd });
      if (r.ok) heard = (await r.json()).text || '';
      else await sleep(2500);
    } catch { await sleep(2500); }
  }
  if (heard === null) { console.log('нет ответа:', key); continue; }
  const d = wordDiff(map[key].text, heard);
  res[key] = { text: map[key].text, heard, ...d };
  if (d.dist > 0) console.log(`≠ ${key}\n   писали:  ${map[key].text}\n   слышно: ${heard}`);
  fs.writeFileSync(OUT, JSON.stringify(res, null, 1));
  await sleep(250);
}
const bad = Object.entries(res).filter(([, v]) => v.dist > 0);
console.log(`\nпроверено ${Object.keys(res).length}, расходится ${bad.length}`);
