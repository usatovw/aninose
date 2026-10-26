#!/usr/bin/env python3
"""Лист выбора: для пары зверей по 25 готовых кропов вокруг текущей точки.
Выбираем ячейку, где нос виден целиком и по центру, и берём её подписи.
Снимать координаты на глаз я пробовал — промахивался раз за разом."""
import json, sys
from PIL import Image, ImageDraw, ImageFont
A = {x['id']: x for x in json.load(open('content/animals.json', encoding='utf-8'))}
OUT, ids = sys.argv[1], sys.argv[2].split(',')
step = float(sys.argv[3]) if len(sys.argv) > 3 else 0.06
D, N = 170, 5
try:
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 13)
    big = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
except OSError:
    f = big = ImageFont.load_default()
mask = Image.new('L', (D, D), 0)
ImageDraw.Draw(mask).ellipse([0, 0, D - 1, D - 1], fill=255)

block_w = N * D
sh = Image.new('RGB', (len(ids) * (block_w + 20), N * (D + 17) + 26), (252, 240, 224))
dr = ImageDraw.Draw(sh)
for bi, pid in enumerate(ids):
    im = Image.open(f'media-src/closeup/{pid}.jpg').convert('RGB')
    w, h = im.size
    base, zoom = A[pid]['noseFocus'], A[pid]['noseZoom']
    ox = bi * (block_w + 20)
    dr.text((ox + 4, 2), f"{pid}  z={zoom}", (10, 10, 10), font=big)
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
            sh.paste(cell, (ox + c * D, 26 + r * (D + 17)))
            dr.text((ox + c * D + 3, 26 + r * (D + 17) + D + 1), f'{fx} {fy}', (150, 0, 0), font=f)
sh.save(f'{OUT}/pick-{"-".join(ids)}.png')
