// Атрибуция обязательна для CC BY / CC BY-SA. Генерируем из метаданных, не руками.
import fs from 'node:fs';
const photos = JSON.parse(fs.readFileSync('content/photo-meta.json','utf8'));
const sounds = JSON.parse(fs.readFileSync('content/sound-meta.json','utf8'));
const sfx    = fs.existsSync('content/sfx-meta.json') ? JSON.parse(fs.readFileSync('content/sfx-meta.json','utf8')) : {};
const animals = JSON.parse(fs.readFileSync('content/animals.json','utf8'));
const ru = Object.fromEntries(animals.map(a => [a.id, a.ru]));

let md = `# Источники и лицензии\n\nВсе материалы использованы по свободным лицензиям.\n\n## Фотографии\n\n`;
md += `| Животное | Файл | Автор | Лицензия |\n|---|---|---|---|\n`;
for (const [id, m] of Object.entries(photos)) {
  md += `| ${ru[id] || id} | [${m.commons}](${m.descUrl || ''}) | ${m.author || '—'} | ${m.license} |\n`;
}
// У части зверей портрет и силуэт — разные снимки: силуэт вырезан из кадра
// во весь рост, который нашёлся отдельно. Такой снимок тоже нужно указать.
const cuts = Object.entries(photos).filter(([, m]) => m.cutSource);
if (cuts.length) {
  md += `\n## Фотографии, из которых вырезаны силуэты\n\n`;
  md += `| Животное | Файл | Автор | Лицензия |\n|---|---|---|---|\n`;
  for (const [id, m] of cuts) {
    const c = m.cutSource;
    md += `| ${ru[id] || id} | [${c.commons || c.title}](${c.descUrl || c.url || ''}) | ${c.author || '—'} | ${c.license} |\n`;
  }
}
md += `\n## Звуки — живые записи\n\n| Животное | Запись | Автор | Лицензия | Источник |\n|---|---|---|---|---|\n`;
for (const [id, m] of Object.entries(sounds)) {
  md += `| ${ru[id] || id} | [${m.title}](${m.url || ''}) | ${m.creator || '—'} | ${String(m.license).toUpperCase()} | ${m.source} |\n`;
}
md += `\n## Звуки — синтезированные\n\nДля видов, у которых не нашлось записи со свободной лицензией, звук сгенерирован (ElevenLabs sound effects):\n\n`;
for (const [id, m] of Object.entries(sfx)) md += `- **${ru[id] || id}** — «${m.prompt}»\n`;
md += `\n## Озвучка\n\nРусский закадровый голос синтезирован через ElevenLabs (модель eleven_multilingual_v2).\n`;
md += `\n## Тексты\n\nФактическая часть основана на статьях English Wikipedia (CC BY-SA 4.0); ссылка на конкретную статью есть на карточке каждого животного и каждого типа носа.\n`;
fs.writeFileSync('ATTRIBUTIONS.md', md);
console.log('ATTRIBUTIONS.md:', md.split('\n').length, 'строк');
