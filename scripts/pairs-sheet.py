#!/usr/bin/env python3
"""Контрольная раскладка: для каждого зверя рядом кадр «целиком» и кадр «нос».
Мелкая сетка врёт — глаз пропускает промахи, поэтому ячейка крупная.
Запуск: python3 scripts/pairs-sheet.py <номер_листа> [выходная_папка]"""
import json, sys, os
from PIL import Image, ImageDraw, ImageFont

OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/pairs'
os.makedirs(OUT, exist_ok=True)
animals = json.load(open('content/animals.json'))
CELL, PER, COLS = 340, 6, 2
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
    small = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 17)
except OSError:
    font = small = ImageFont.load_default()

def box(path):
    try:
        im = Image.open(path).convert('RGB')
    except OSError:
        im = Image.new('RGB', (CELL, CELL), (220, 90, 90))
    im.thumbnail((CELL, CELL))
    bg = Image.new('RGB', (CELL, CELL), (248, 244, 236))
    bg.paste(im, ((CELL - im.width) // 2, (CELL - im.height) // 2))
    return bg

n = int(sys.argv[1])
chunk = animals[n * PER:(n + 1) * PER]
rows = (len(chunk) + COLS - 1) // COLS
W, RH = COLS * (CELL * 2 + 24), CELL + 54
sheet = Image.new('RGB', (W, rows * RH), (255, 255, 255))
dr = ImageDraw.Draw(sheet)
for i, a in enumerate(chunk):
    x = (i % COLS) * (CELL * 2 + 24)
    y = (i // COLS) * RH
    sheet.paste(box(f"public/media/photos/{a['id']}.jpg"), (x, y + 30))
    sheet.paste(box(f"public/media/noses/{a['id']}.jpg"), (x + CELL + 8, y + 30))
    dr.text((x + 4, y + 4), f"{a['id']}  ({a['ru']})", (20, 20, 20), font=font)
    dr.text((x + 4, y + CELL + 34), 'целиком', (110, 110, 110), font=small)
    dr.text((x + CELL + 12, y + CELL + 34), 'нос', (110, 110, 110), font=small)
sheet.save(f'{OUT}/pairs{n}.png')
print(' '.join(a['id'] for a in chunk))
