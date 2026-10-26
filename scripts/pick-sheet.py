#!/usr/bin/env python3
"""Раскладка кандидатов на кадр «зверь целиком»: строка на вид, номера под кадрами.
Выбор делается глазами — автоотбор по заголовку уже подсовывал не тех."""
import json, sys, os
from PIL import Image, ImageDraw, ImageFont
CAND = json.load(open('scripts/.media-cache/whole.json'))
RU = {a['id']: a['ru'] for a in json.load(open('content/animals.json'))}
DIR, OUT = 'scripts/.media-cache/thumbs', sys.argv[2]
CELL, PER = 215, 6
try:
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 19)
    s = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
except OSError:
    f = s = ImageFont.load_default()
ids = [i for i in CAND if any(os.path.exists(f'{DIR}/{i}-{k}.jpg') for k in range(8))]
chunk = ids[int(sys.argv[1]) * PER:(int(sys.argv[1]) + 1) * PER]
W = 8 * CELL + 150
sheet = Image.new('RGB', (W, len(chunk) * (CELL + 24)), (255, 255, 255))
dr = ImageDraw.Draw(sheet)
for r, pid in enumerate(chunk):
    y = r * (CELL + 24)
    dr.text((4, y + CELL // 2), f'{pid}\n{RU.get(pid, "")}', (10, 10, 10), font=f)
    for i in range(8):
        p = f'{DIR}/{pid}-{i}.jpg'
        if not os.path.exists(p):
            continue
        im = Image.open(p).convert('RGB'); im.thumbnail((CELL - 6, CELL - 6))
        bx = 150 + i * CELL
        sheet.paste(im, (bx + (CELL - im.width) // 2, y + (CELL - im.height) // 2))
        dr.text((bx + 4, y + CELL + 2), str(i), (190, 0, 0), font=s)
if chunk: sheet.save(f'{OUT}/pick{sys.argv[1]}.png')
print(' '.join(chunk))
