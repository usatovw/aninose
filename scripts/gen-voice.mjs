// Озвучка через ElevenLabs. Озвучиваем только то, что слышит Стеша:
// детский текст, названия, фразы интерфейса. Текст «для папы» не озвучиваем — экономия кредитов.
// Кэш по хешу текста: повторный прогон не тратит кредиты.
import fs from 'node:fs';
import crypto from 'node:crypto';

const KEY = (fs.readFileSync('.env','utf8').match(/ELEVENLABS_API_KEY=(.+)/)||[])[1]?.trim();
if (!KEY) { console.error('no key'); process.exit(1); }
const VOICE = 'cgSgspJ2msm6clMCkdW9';           // Jessica — playful/cute, тёплый женский
const MODEL = 'eleven_multilingual_v2';          // стабильнее v3 для русского в длинной пачке
const OUT = 'public/media/voice';
const MAP = 'content/voice-map.json';
fs.mkdirSync(OUT, { recursive: true });
const map = fs.existsSync(MAP) ? JSON.parse(fs.readFileSync(MAP,'utf8')) : {};
const sleep = ms => new Promise(r => setTimeout(r, ms));

const animals = JSON.parse(fs.readFileSync('content/animals.json','utf8'));
const types   = JSON.parse(fs.readFileSync('content/nose-types.json','utf8'));

// Текст для синтеза отличается от экранного. Проверка распознаванием
// (scripts/check-voice.mjs) показала две устойчивые поломки:
//   • одиночное короткое слово модель уводит в чужой язык —
//     «Лев» читался как Hello, «Страус» как Strauss, «Акула» как Экола;
//   • тире она озвучивает словом: «закрывать — чтобы» → «закрывать, Маш, чтобы».
// Поэтому имена уходят в несущей фразе, а тире и двоеточия заменяются запятой.
const OV = JSON.parse(fs.readFileSync('content/voice-overrides.json', 'utf8'));
const speakable = t => t.replace(/\s*[—–]\s*/g, ', ').replace(/\s*:\s*/g, ', ')
                        .replace(/,\s*,/g, ',').replace(/\s+/g, ' ').trim();
// имя со строчной: с заглавной модель принимает его за имя собственное
const carrier = name => OV._carrier_name.replace('{}',
  OV._lowercase_carrier ? name.charAt(0).toLowerCase() + name.slice(1) : name);

const lines = [];
const add = (key, text) => lines.push({ key, text: speakable(text) });
for (const a of animals) {
  add(`a-${a.id}-name`, OV[`a-${a.id}-name`] || carrier(a.ru));
  add(`a-${a.id}-kid`, OV[`a-${a.id}-kid`] || a.kid);
}
for (const t of types) {
  add(`t-${t.id}-name`, OV[`t-${t.id}-name`] || carrier(t.name));
  add(`t-${t.id}-kid`, OV[`t-${t.id}-kid`] || t.kid);
  add(`t-${t.id}-why`, OV[`t-${t.id}-why`] || t.why);
}
for (const [k,v] of Object.entries({
  'ui-hello':'Привет, Стеша! Пойдём смотреть носики?',
  'ui-pick':'Выбирай носик!',
  'ui-tap-nose':'Нажми на носик!',
  'ui-yes':'Правильно! Умница!',
  'ui-no':'Почти! Попробуй ещё разок.',
  'ui-album':'Смотри, сколько носиков ты уже нашла!',
  'ui-back':'Идём назад',
  'ui-game':'Давай поиграем! Чей это носик?',
})) add(k, v);

// Режим выгрузки: отдаём готовые строки питону, он проставляет ударения
// через ruaccent (словарь + модель омографов), и мы синтезируем уже их.
// Без ударений модель читает «бабочка» как «бабУшка», «звездонос» наугад.
if (process.argv.includes('--dump')) {
  fs.writeFileSync('content/voice-lines.json', JSON.stringify(lines, null, 1));
  console.log('строк выгружено:', lines.length);
  process.exit(0);
}
const STRESS = fs.existsSync('content/voice-stress.json')
  ? JSON.parse(fs.readFileSync('content/voice-stress.json', 'utf8')) : {};

let spent = 0, made = 0, cached = 0;
for (const { key, text: plain } of lines) {
  const text = STRESS[key] || plain;
  const h = crypto.createHash('sha1').update(MODEL + VOICE + text).digest('hex').slice(0,12);
  if (map[key]?.hash === h && fs.existsSync(`${OUT}/${key}.mp3`)) { cached++; continue; }
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`, {
    method:'POST',
    headers:{ 'xi-api-key':KEY, 'Content-Type':'application/json' },
    body: JSON.stringify({ text, model_id: MODEL,
      // stability 0.45 давала дрейф в чужой язык на коротких строках
      voice_settings:{ stability:0.75, similarity_boost:0.8, style:0.1, use_speaker_boost:true } }),
  });
  if (!r.ok) { console.log('FAIL', key, r.status, (await r.text()).slice(0,110)); await sleep(1500); continue; }
  fs.writeFileSync(`${OUT}/${key}.mp3`, Buffer.from(await r.arrayBuffer()));
  map[key] = { hash:h, text, chars:text.length };
  spent += text.length; made++;
  fs.writeFileSync(MAP, JSON.stringify(map,null,1));
  if (made % 10 === 0) console.log(`  ...${made} done, ~${spent} credits`);
  await sleep(350);
}
console.log(`voice: ${made} new, ${cached} cached, ~${spent} credits used this run`);
