"""Вырезает зверя из фона. Нужно для нового визуала: зверь стоит на плоском
цвете, как на референсах, а не лежит фотографией в круге.
Не для всех кадров сработает: у макро-снимков морды силуэта нет, а
животное в пёстрой листве модель не отделяет — такие ловим на приёмке."""
import os, json, io
os.environ.setdefault('U2NET_HOME', '/root/.u2net')
from rembg import remove, new_session
from PIL import Image

OUT = 'public/media/cut'
os.makedirs(OUT, exist_ok=True)
sess = new_session('u2net')
animals = json.load(open('content/animals.json'))
report = {}
for x in animals:
    aid = x['id']
    dst = f'{OUT}/{aid}.png'
    if os.path.exists(dst):
        report[aid] = 'cached'; continue
    im = Image.open(f'public/media/photos/{aid}.jpg').convert('RGB')
    cut = remove(im, session=sess)
    bbox = cut.getbbox()
    if not bbox:
        report[aid] = 'empty'; print('ПУСТО', aid); continue
    cut = cut.crop(bbox)
    # доля непрозрачных пикселей: если модель оставила огрызок — это брак
    alpha = cut.getchannel('A')
    filled = sum(alpha.histogram()[200:]) / (cut.width * cut.height)
    cut.thumbnail((900, 900), Image.LANCZOS)
    cut.save(dst, 'PNG', optimize=True)
    report[aid] = round(filled, 3)
    print(f'{aid:18s} {cut.width}x{cut.height}  заполнено {filled:.0%}')
json.dump(report, open('content/cut-report.json', 'w'), ensure_ascii=False, indent=1)
print('готово:', len(report))
