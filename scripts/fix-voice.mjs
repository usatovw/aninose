// Замкнутый цикл для строк, которые синтез стабильно ломает:
// синтезируем → распознаём → не совпало → меняем настройки голоса и повторяем.
// «Это страус» уезжало в «Что-то страус», «Это тюлень» — в «Это Цю Лянь»:
// это дрейф модели, он лечится поднятием stability и снижением style.
import fs from 'node:fs';
import crypto from 'node:crypto';

const KEY = (fs.readFileSync('.env', 'utf8').match(/ELEVENLABS_API_KEY=(.+)/) || [])[1]?.trim();
const VOICE = 'cgSgspJ2msm6clMCkdW9';
const MODEL = 'eleven_multilingual_v2';
const OUT = 'public/media/voice';
const MAP = 'content/voice-map.json';
const map = JSON.parse(fs.readFileSync(MAP, 'utf8'));
// синтезируем вариант с ударениями — он же лежит в карте
const STRESS = fs.existsSync('content/voice-stress.json')
  ? JSON.parse(fs.readFileSync('content/voice-stress.json', 'utf8')) : {};
const sleep = ms => new Promise(r => setTimeout(r, ms));

// знаки ударения в сравнении не участвуют: они влияют на речь, не на слова
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '')
                   .toLowerCase().replace(/ё/g, 'е')
                   .replace(/[^а-я0-9 ]/gi, ' ').replace(/\s+/g, ' ').trim();

const TRIES = [
  { stability: 0.75, similarity_boost: 0.8, style: 0.1, use_speaker_boost: true },
  { stability: 0.9,  similarity_boost: 0.85, style: 0.0, use_speaker_boost: true },
  { stability: 0.6,  similarity_boost: 0.7, style: 0.0, use_speaker_boost: false },
];

async function tts(text, vs) {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`, {
    method: 'POST', headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, model_id: MODEL, voice_settings: vs }),
  });
  return r.ok ? Buffer.from(await r.arrayBuffer()) : null;
}
async function stt(buf, name) {
  const fd = new FormData();
  fd.append('model_id', 'scribe_v1'); fd.append('language_code', 'rus');
  fd.append('file', new Blob([buf]), name);
  const r = await fetch('https://api.elevenlabs.io/v1/speech-to-text',
                        { method: 'POST', headers: { 'xi-api-key': KEY }, body: fd });
  return r.ok ? (await r.json()).text || '' : null;
}

const keys = process.argv.slice(2);
for (const key of keys) {
  const text = STRESS[key] || map[key]?.text;
  if (!text) { console.log('нет такой строки:', key); continue; }
  let ok = false;
  for (const vs of TRIES) {
    const buf = await tts(text, vs);
    if (!buf) { await sleep(1500); continue; }
    const heard = await stt(buf, `${key}.mp3`);
    const good = heard !== null && norm(heard) === norm(text);
    console.log(`${key} · stab ${vs.stability} → «${heard}» ${good ? '✓' : '✗'}`);
    if (good) {
      fs.writeFileSync(`${OUT}/${key}.mp3`, buf);
      map[key].hash = crypto.createHash('sha1').update(MODEL + VOICE + text).digest('hex').slice(0, 12);
      fs.writeFileSync(MAP, JSON.stringify(map, null, 1));
      ok = true; break;
    }
    await sleep(500);
  }
  if (!ok) console.log(`  ${key}: ни одна настройка не дала чистого чтения`);
}
