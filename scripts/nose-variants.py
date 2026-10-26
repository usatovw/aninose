#!/usr/bin/env python3
"""Три варианта тесноты кропа на каждого зверя, в том виде, в каком
кадр появляется на странице — круг. Единая доля не работает: часть
исходников сама по себе макро, и 0.34 превращает нос в кожу."""
import json, sys, os
from PIL import Image, ImageDraw, ImageFont
SRC = 'media-src/closeup'
OUT = sys.argv[1]
animals = json.load(open('content/animals.json'))
FRACS = [0.34, 0.55, 0.80, 1.00]
D, PER = 215, 7
try:
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 17)
    s = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
except OSError:
    f = s = ImageFont.load_default()

def crop(a, frac):
    im = Image.open(f"{SRC}/{a['id']}.jpg").convert('RGB')
    w, h = im.size
    side = int(min(w, h) * frac)
    cx = min(max(int(a['noseFocus']['x'] * w), side // 2), w - side // 2)
    cy = min(max(int(a['noseFocus']['y'] * h), side // 2), h - side // 2)
    c = im.crop((cx - side // 2, cy - side // 2, cx + side // 2, cy + side // 2))
    c = c.resize((D, D), Image.LANCZOS)
    mask = Image.new('L', (D, D), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, D - 1, D - 1], fill=255)
    out = Image.new('RGB', (D, D), (252, 240, 224))
    out.paste(c, (0, 0), mask)
    return out

n = int(sys.argv[2])
chunk = animals[n * PER:(n + 1) * PER]
sheet = Image.new('RGB', (len(FRACS) * D + 150, len(chunk) * (D + 20)), (252, 240, 224))
dr = ImageDraw.Draw(sheet)
for r, a in enumerate(chunk):
    y = r * (D + 20)
    dr.text((4, y + D // 2), f"{a['id']}\n{a['ru']}", (10, 10, 10), font=f)
    for i, fr in enumerate(FRACS):
        sheet.paste(crop(a, fr), (150 + i * D, y))
        dr.text((150 + i * D + 6, y + D + 1), f'{fr:.2f}', (170, 0, 0), font=s)
sheet.save(f'{OUT}/nv{n}.png')
