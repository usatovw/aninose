#!/usr/bin/env python3
"""Мягкая чистка вырезов: rembg оставляет полупрозрачную дымку фона и
отдельные ошмётки травы. Убираем только то, что не держится за силуэт,
край не трогаем — иначе получается пила."""
import os, json
import numpy as np
from PIL import Image
from scipy import ndimage

SRC = 'public/media/cut'
report = {}

for f in sorted(os.listdir(SRC)):
    if not f.endswith('.png'):
        continue
    p = os.path.join(SRC, f)
    arr = np.array(Image.open(p).convert('RGBA'))
    a = arr[:, :, 3].astype(np.float32) / 255

    body = a > 0.2
    if not body.any():
        continue
    lbl, n = ndimage.label(body)
    sizes = ndimage.sum(body, lbl, range(1, n + 1))
    keep = np.zeros_like(body)
    biggest = sizes.max()
    for i, s in enumerate(sizes, start=1):
        if s >= biggest * 0.02:
            keep |= (lbl == i)

    a = np.where(keep, a, 0.0)
    a = np.where(a < 0.2, 0.0, a)          # дымка
    arr[:, :, 3] = np.clip(a * 255, 0, 255).astype(np.uint8)

    ys, xs = np.where(arr[:, :, 3] > 16)
    if len(ys) == 0:
        continue
    out = Image.fromarray(arr[ys.min():ys.max() + 1, xs.min():xs.max() + 1])
    out.save(p)
    report[f[:-4]] = {'w': out.width, 'h': out.height,
                      'fill': round(float((np.array(out)[:, :, 3] > 128).mean()), 3)}

json.dump(report, open('content/cut-report.json', 'w'), indent=1, ensure_ascii=False)
print(f'очищено {len(report)}')

# ── сжатие ──────────────────────────────────────────────────────────
# Силуэты — это фотографии с альфой, PNG хранит их без потерь и весит
# десятки мегабайт. Для показа на экране хватает 256 цветов: вес падает
# втрое, разницы на глаз нет. Запускается отдельно: python3 scripts/clean-cut.py --squeeze
if __name__ == '__main__' and '--squeeze' in __import__('sys').argv:
    before = after = 0
    for f in sorted(os.listdir(SRC)):
        if not f.endswith('.png'):
            continue
        p = os.path.join(SRC, f)
        before += os.path.getsize(p)
        im = Image.open(p).convert('RGBA')
        if max(im.size) > 760:
            k = 760 / max(im.size)
            im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
        im.quantize(colors=255, method=Image.FASTOCTREE).save(p, optimize=True)
        after += os.path.getsize(p)
    print(f'сжато: {before/1e6:.1f} МБ → {after/1e6:.1f} МБ')
