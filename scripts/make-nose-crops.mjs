// Слой «нос» должен быть настоящим макро, а не тем же кадром, увеличенным на четверть.
// Берём не основной снимок (на нём теперь зверь целиком, нос там мелкий и мыльный),
// а отдельный близкий кадр из media-src/closeup — он изначально снят на морде,
// и координаты noseFocus выставлены именно по нему.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const SRC = 'media-src/closeup';
const DST = 'public/media/noses';
// Доля стороны у каждого зверя своя: часть исходников сама по себе макро,
// и общая величина у них залезает внутрь мочки носа — на экране это
// оранжевое пятно с чёрной дырой, а не нос. Значения подобраны глазами
// на круглом превью, в том виде, в каком кадр показывается на странице.
const DEFAULT_FRAC = 0.55;
const SIZE = 760;

const animals = JSON.parse(fs.readFileSync('content/animals.json', 'utf8'));
fs.mkdirSync(DST, { recursive: true });
const report = [];

for (const a of animals) {
  const src = `${SRC}/${a.id}.jpg`;
  if (!fs.existsSync(src)) { report.push([a.id, 'нет исходника']); continue; }
  const [w, h] = execFileSync('python3', ['-c',
    `from PIL import Image;im=Image.open("${src}");print(im.width,im.height)`])
    .toString().trim().split(' ').map(Number);

  const side = Math.round(Math.min(w, h) * (a.noseZoom || DEFAULT_FRAC));
  // центр кропа держим внутри кадра, иначе нос уезжает за край
  const cx = Math.min(Math.max(Math.round(a.noseFocus.x * w), side / 2), w - side / 2);
  const cy = Math.min(Math.max(Math.round(a.noseFocus.y * h), side / 2), h - side / 2);
  const x = Math.round(cx - side / 2), y = Math.round(cy - side / 2);

  execFileSync('python3', ['-c', `
from PIL import Image
im = Image.open("${src}").convert("RGB").crop((${x}, ${y}, ${x + side}, ${y + side}))
im = im.resize((${SIZE}, ${SIZE}), Image.LANCZOS)
im.save("${DST}/${a.id}.jpg", quality=88, optimize=True)
`]);
  report.push([a.id, `${side}px из ${w}x${h}`]);
}
console.log(report.map(r => r.join(' — ')).join('\n'));
console.log('кропов носа:', report.filter(r => !r[1].startsWith('нет')).length);
