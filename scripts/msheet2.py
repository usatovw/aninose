#!/usr/bin/env python3
"""Раскладка кандидатов по нескольким видам сразу: по строке на вид."""
import sys, os
from PIL import Image, ImageDraw, ImageFont
DIR='scripts/.media-cache/mthumbs'; OUT=sys.argv[1]; name=sys.argv[2]
ids=sys.argv[3].split(','); CELL=175; COLS=12
try: f=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",15)
except OSError: f=ImageFont.load_default()
rows=[]
for pid in ids:
    fs=sorted(x for x in os.listdir(DIR) if x.startswith(pid+'-'))[:COLS*2]
    rows.append((pid,fs))
H=sum(((len(fs)+COLS-1)//COLS)*(CELL+18) for _,fs in rows)
sh=Image.new('RGB',(COLS*CELL+110,H),(255,255,255)); dr=ImageDraw.Draw(sh)
y=0
for pid,fs in rows:
    dr.text((4,y+10),pid,(10,10,10),font=f)
    for i,fn in enumerate(fs):
        im=Image.open(os.path.join(DIR,fn)).convert('RGB'); im.thumbnail((CELL-6,CELL-6))
        x=110+(i%COLS)*CELL; yy=y+(i//COLS)*(CELL+18)
        sh.paste(im,(x+(CELL-im.width)//2,yy+(CELL-im.height)//2))
        dr.text((x+3,yy+CELL+1),fn.split('-')[-1][:2],(190,0,0),font=f)
    y+=((len(fs)+COLS-1)//COLS)*(CELL+18)
sh.save(f'{OUT}/g-{name}.png')
