// Приёмочный гейт. Запускается перед сборкой: если что-то не проверено или
// отсутствует файл — сборка падает, а не уезжает к ребёнку наполовину готовой.
import fs from 'node:fs';
import { isSafe } from './safety.mjs';

const animals = JSON.parse(fs.readFileSync('content/animals.json','utf8'));
const types   = JSON.parse(fs.readFileSync('content/nose-types.json','utf8'));
const photos  = JSON.parse(fs.readFileSync('content/photo-meta.json','utf8'));
const qa      = JSON.parse(fs.readFileSync('content/qa.json','utf8'));
const voice   = JSON.parse(fs.readFileSync('content/voice-map.json','utf8'));
const errors = [], warn = [];
const typeIds = new Set(types.map(t => t.id));

for (const a of animals) {
  const where = `animal ${a.id}`;
  if (!a.kid?.trim())    errors.push(`${where}: нет детского текста`);
  if (!a.parent?.trim()) errors.push(`${where}: нет текста для родителя`);
  if (!typeIds.has(a.type)) errors.push(`${where}: неизвестный тип носа «${a.type}»`);
  if (!fs.existsSync(`public/media/photos/${a.id}.jpg`)) errors.push(`${where}: нет фото`);
  if (!fs.existsSync(`public/media/noses/${a.id}.jpg`))  errors.push(`${where}: нет кропа носа`);
  if (!photos[a.id]?.license || photos[a.id].license === 'unknown')
    errors.push(`${where}: не определена лицензия фото`);
  if (!photos[a.id]?.author || photos[a.id].author === 'unknown')
    warn.push(`${where}: не указан автор фото`);
  if (!isSafe(photos[a.id]?.commons)) errors.push(`${where}: фото не прошло проверку безопасности`);
  if (/dall|midjourney|stable.diffusion|ai.generated/i.test(photos[a.id]?.commons || ''))
    errors.push(`${where}: фото сгенерировано ИИ, нужно настоящее`);
  if (!qa[a.id]?.noseVisible) errors.push(`${where}: нос на кропе не подтверждён приёмкой`);
  if (!voice[`a-${a.id}-kid`]) errors.push(`${where}: нет озвучки детского текста`);
  if (!voice[`a-${a.id}-name`]) errors.push(`${where}: нет озвучки названия`);
  if (!fs.existsSync(`public/media/sounds/${a.id}.mp3`)) warn.push(`${where}: нет звука`);
}
for (const t of types) {
  if (!t.sources?.length) errors.push(`type ${t.id}: нет источника`);
  if (!voice[`t-${t.id}-kid`]) errors.push(`type ${t.id}: нет озвучки`);
  if (!animals.some(a => a.type === t.id)) errors.push(`type ${t.id}: ни одного животного`);
}

if (warn.length)  console.log('⚠  предупреждения:\n' + warn.map(w => '   ' + w).join('\n'));
if (errors.length) {
  console.error(`\n✖ приёмка не пройдена (${errors.length}):\n` + errors.map(e => '   ' + e).join('\n'));
  process.exit(1);
}
console.log(`✓ приёмка пройдена: ${animals.length} животных, ${types.length} типов носов`);
