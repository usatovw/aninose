#!/usr/bin/env python3
import json, sys, os
from PIL import Image, ImageDraw, ImageFont
DIR='scripts/.media-cache/mthumbs'; OUT=sys.argv[1]; pid=sys.argv[2]
files=sorted(f for f in os.listdir(DIR) if f.startswith(pid+'-'))
CELL,COLS=235,8
try: f=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",17)
except OSError: f=ImageFont.load_default()
rows=(len(files)+COLS-1)//COLS
sh=Image.new('RGB',(COLS*CELL,rows*(CELL+22)),(255,255,255)); dr=ImageDraw.Draw(sh)
for i,fn in enumerate(files):
    im=Image.open(os.path.join(DIR,fn)).convert('RGB'); im.thumbnail((CELL-6,CELL-6))
    x=(i%COLS)*CELL; y=(i//COLS)*(CELL+22)
    sh.paste(im,(x+(CELL-im.width)//2,y+(CELL-im.height)//2))
    dr.text((x+4,y+CELL+2),fn.split('-')[-1][:2],(190,0,0),font=f)
sh.save(f'{OUT}/m-{pid}.png'); print(len(files))
