#!/usr/bin/env python3
"""Слой «нос»: тесный кадр, в центре которого ровно нос.

Два правила, за которые пришлось заплатить двумя итерациями:
  • на странице кадр показывается КРУГОМ, вписанным в квадрат, поэтому
    нос обязан быть в самой середине — иначе маска его срежет;
  • если точка носа близко к краю снимка, квадрат нельзя двигать внутрь
    (нос съедет) и нельзя ужимать (кроп мылится). Достраиваем края
    продолжением крайних пикселей: на ободе круга это не читается.
"""
import json, os
from PIL import Image

SRC, DST = 'media-src/closeup', 'public/media/noses'
DEFAULT_ZOOM, SIZE = 0.55, 760
os.makedirs(DST, exist_ok=True)
animals = json.load(open('content/animals.json', encoding='utf-8'))
report = []

for a in animals:
    src = f"{SRC}/{a['id']}.jpg"
    if not os.path.exists(src):
        report.append((a['id'], 'нет исходника', 0)); continue
    im = Image.open(src).convert('RGB')
    w, h = im.size
    cx, cy = round(a['noseFocus']['x'] * w), round(a['noseFocus']['y'] * h)
    want = round(min(w, h) * a.get('noseZoom', DEFAULT_ZOOM))
    # Центр не двигаем ни на пиксель — иначе круглая маска срежет нос.
    # Если вокруг точки меньше места, чем просили, просто берём меньше:
    # достраивать край нечем, любая подложка видна пятном.
    room = 2 * min(cx, cy, w - cx, h - cy)
    side = min(want, room)
    cut = im.crop((cx - side // 2, cy - side // 2, cx + side // 2, cy + side // 2))
    cut.resize((SIZE, SIZE), Image.LANCZOS).save(f"{DST}/{a['id']}.jpg", quality=89, optimize=True)
    report.append((a['id'], f'{side}px из {want}px', side))

tight = [r for r in report if isinstance(r[2], int) and r[2] and r[2] < 320]
print('\n'.join(f'{i} — {s}' for i, s, _ in report))
if tight:
    print('\nмало места вокруг носа, кадр будет мягким:',
          ', '.join(f'{i} ({n}px)' for i, _, n in tight))
print('кропов носа:', len(report))
