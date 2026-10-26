#!/bin/sh
# Единая мягкая обработка всех звуков: плавный вход и выход, компрессия
# скачков, срез самых колючих верхов, одинаковая громкость.
# Ребёнок испугался резкого звука — такого быть не должно ни у кого.
for F in public/media/sounds/*.mp3; do
  ffmpeg -v error -y -i "$F" \
    -af "lowpass=f=7000,acompressor=threshold=-18dB:ratio=4:attack=25:release=250,\
afade=t=in:st=0:d=0.14,areverse,afade=t=in:st=0:d=0.3,areverse,\
loudnorm=I=-19:TP=-2:LRA=6" \
    -ac 1 -ar 44100 -b:a 96k "/tmp/soft-$(basename "$F")"
  mv "/tmp/soft-$(basename "$F")" "$F"
done
echo "смягчено: $(ls public/media/sounds/*.mp3 | wc -l)"
