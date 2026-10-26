#!/bin/sh
# Ставит звук в приложение: обрезает до приятной длины, убирает резкий
# старт и конец фейдом, выравнивает громкость по остальным.
# Аргументы: <id> <файл> [секунды]
ID=$1; SRC=$2; LEN=${3:-2.8}
ffmpeg -v error -y -i "$SRC" -t "$LEN" \
  -af "afade=t=in:st=0:d=0.12,afade=t=out:st=$(echo "$LEN-0.35"|bc):d=0.35,loudnorm=I=-18:TP=-1.5:LRA=8" \
  -ac 1 -ar 44100 -b:a 96k "public/media/sounds/$ID.mp3"
echo "$ID готов"
