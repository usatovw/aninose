#!/usr/bin/env python3
"""Исходник слоя носа в своих пропорциях, с сеткой 0.1, текущей точкой
и прямоугольником того окна, которое реально попадёт в круг на странице.
Квадратная растяжка в прошлой версии сбивала чтение координат."""
import json, sys
from PIL import Image, ImageDraw, ImageFont
A = {x['id']: x for x in json.load(open('content/animals.json', encoding='utf-8'))}
OUT, name, ids = sys.argv[1], sys.argv[2], sys.argv[3].split(',')
W, COLS = 560, 2
try:
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
    t = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 13)
except OSError:
    f = t = ImageFont.load_default()

tiles = []
for pid in ids:
    im = Image.open(f'media-src/closeup/{pid}.jpg').convert('RGB')
    ow, oh = im.size
    k = W / ow
    im = im.resize((W, round(oh * k)), Image.LANCZOS)
    w, h = im.size
    d = ImageDraw.Draw(im)
    for j in range(1, 10):
        x = int(w * j / 10); y = int(h * j / 10)
        d.line([(x, 0), (x, h)], fill=(255, 0, 0) if j == 5 else (255, 255, 0))
        d.line([(0, y), (w, y)], fill=(255, 0, 0) if j == 5 else (255, 255, 0))
        d.text((x + 2, 2), f'.{j}', fill=(255, 0, 0), font=t)
        d.text((2, y + 2), f'.{j}', fill=(0, 120, 255), font=t)
    nf, z = A[pid]['noseFocus'], A[pid]['noseZoom']
    cx, cy = nf['x'] * w, nf['y'] * h
    room = 2 * min(cx, cy, w - cx, h - cy)
    side = min(min(w, h) * z, room)
    d.rectangle([cx - side/2, cy - side/2, cx + side/2, cy + side/2], outline=(0, 255, 255), width=4)
    d.ellipse([cx - 8, cy - 8, cx + 8, cy + 8], outline=(0, 255, 0), width=4)
    tiles.append((pid, im, f"{pid}  {nf['x']},{nf['y']}  z={z}"))

rowh = max(im.height for _, im, _ in tiles) + 28
rows = (len(tiles) + COLS - 1) // COLS
sh = Image.new('RGB', (COLS * (W + 10), rows * rowh), (255, 255, 255))
dr = ImageDraw.Draw(sh)
for i, (pid, im, cap) in enumerate(tiles):
    x, y = (i % COLS) * (W + 10), (i // COLS) * rowh
    sh.paste(im, (x, y + 24))
    dr.text((x + 2, y + 3), cap, (10, 10, 10), font=f)
sh.save(f'{OUT}/grid-{name}.png')
