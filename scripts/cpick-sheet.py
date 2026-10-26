#!/usr/bin/env python3
"""Раскладка кандидатов Викисклада для конкретного списка видов."""
import json, sys, os
from PIL import Image, ImageDraw, ImageFont
C = json.load(open('scripts/.media-cache/commons.json'))
RU = {a['id']: a['ru'] for a in json.load(open('content/animals.json'))}
DIR, OUT = 'scripts/.media-cache/cthumbs', sys.argv[1]
ids = sys.argv[3].split(',')
CELL = 215
try:
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 19)
    s = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
except OSError:
    f = s = ImageFont.load_default()
sheet = Image.new('RGB', (8 * CELL + 150, len(ids) * (CELL + 24)), (255, 255, 255))
dr = ImageDraw.Draw(sheet)
for r, pid in enumerate(ids):
    y = r * (CELL + 24)
    dr.text((4, y + CELL // 2), f'{pid}\n{RU.get(pid, "")}', (10, 10, 10), font=f)
    for i in range(8):
        p = f'{DIR}/{pid}-{i}.jpg'
        if not os.path.exists(p): continue
        im = Image.open(p).convert('RGB'); im.thumbnail((CELL - 6, CELL - 6))
        bx = 150 + i * CELL
        sheet.paste(im, (bx + (CELL - im.width) // 2, y + (CELL - im.height) // 2))
        dr.text((bx + 4, y + CELL + 2), str(i), (190, 0, 0), font=s)
sheet.save(f'{OUT}/cpick{sys.argv[2]}.png')
