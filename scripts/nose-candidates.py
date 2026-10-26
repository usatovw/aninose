#!/usr/bin/env python3
"""Сетка готовых кропов вокруг текущей точки: вместо того чтобы снимать
координаты на глаз (я так промахнулся трижды), выбираем нужную ячейку
по картинке и берём её подписанные координаты."""
import json, sys
from PIL import Image, ImageDraw, ImageFont
A = {x['id']: x for x in json.load(open('content/animals.json', encoding='utf-8'))}
OUT, pid = sys.argv[1], sys.argv[2]
zoom = float(sys.argv[3]) if len(sys.argv) > 3 else A[pid]['noseZoom']
step = float(sys.argv[4]) if len(sys.argv) > 4 else 0.10
D, N = 210, 5
try:
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
except OSError:
    f = ImageFont.load_default()
im = Image.open(f'media-src/closeup/{pid}.jpg').convert('RGB')
w, h = im.size
base = A[pid]['noseFocus']
sh = Image.new('RGB', (N * D, N * (D + 20)), (252, 240, 224))
dr = ImageDraw.Draw(sh)
mask = Image.new('L', (D, D), 0)
ImageDraw.Draw(mask).ellipse([0, 0, D - 1, D - 1], fill=255)
for r in range(N):
    for c in range(N):
        fx = round(base['x'] + (c - N // 2) * step, 3)
        fy = round(base['y'] + (r - N // 2) * step, 3)
        cx, cy = fx * w, fy * h
        room = 2 * min(cx, cy, w - cx, h - cy)
        side = int(max(40, min(min(w, h) * zoom, room)))
        cut = im.crop((int(cx - side/2), int(cy - side/2),
                       int(cx - side/2) + side, int(cy - side/2) + side)).resize((D, D), Image.LANCZOS)
        cell = Image.new('RGB', (D, D), (252, 240, 224))
        cell.paste(cut, (0, 0), mask)
        sh.paste(cell, (c * D, r * (D + 20)))
        dr.text((c * D + 4, r * (D + 20) + D + 2), f'{fx} {fy}', (150, 0, 0), font=f)
sh.save(f'{OUT}/cand-{pid}.png')
print(pid, 'zoom', zoom, 'шаг', step)
