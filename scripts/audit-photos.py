#!/usr/bin/env python3
"""Контрольная раскладка всех основных кадров: видно ли зверя целиком."""
import json, sys
from PIL import Image, ImageDraw, ImageFont
animals = json.load(open('content/animals.json'))
OUT = sys.argv[1]; n = int(sys.argv[2])
CELL, COLS, PER = 280, 5, 20
try:
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
except OSError:
    f = ImageFont.load_default()
chunk = animals[n*PER:(n+1)*PER]
rows = (len(chunk) + COLS - 1) // COLS
sh = Image.new('RGB', (COLS*CELL, rows*(CELL+24)), (255, 255, 255))
dr = ImageDraw.Draw(sh)
for i, a in enumerate(chunk):
    im = Image.open(f"public/media/photos/{a['id']}.jpg").convert('RGB')
    im.thumbnail((CELL-6, CELL-6))
    x, y = (i % COLS)*CELL, (i // COLS)*(CELL+24)
    sh.paste(im, (x+3, y+3))
    dr.text((x+4, y+CELL+2), f"{a['id']} {a['ru']}", (10, 10, 10), font=f)
sh.save(f'{OUT}/audit{n}.png')
