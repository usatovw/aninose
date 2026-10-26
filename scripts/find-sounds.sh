#!/bin/sh
# Openverse без ключа отдаёт 401 при частых запросах — ходим редко.
# Слова испуга отсекаем: ребёнок уже наткнулся на «Angry hedgehog».
for Q in "$@"; do
  ID=${Q%%|*}; TXT=${Q#*|}
  curl -s --get "https://api.openverse.org/v1/audio/" \
    --data-urlencode "q=$TXT" --data-urlencode "license=cc0" --data-urlencode "page_size=20" \
    -H "User-Agent: aninose/1.0 (kids education)" > "/tmp/ov-$ID.json"
  python3 - "$ID" "$TXT" <<'PY'
import json, re, sys, os
ID, TXT = sys.argv[1], sys.argv[2]
SCARY = re.compile(r'(angry|aggress|attack|growl|snarl|scream|screech|roar|hiss|fight|distress|alarm|warning|pain|kill|hunt|shot|gun|horror|scary)', re.I)
JUNK  = re.compile(r'(LL-Q|pronunciation|\bdoor\b|\bmusic\b|\bsong\b|remix|\bbeat\b|\bloop\b|guitar|piano|drum|synth|spoken|\bhuman\b)', re.I)
d = json.load(open(f'/tmp/ov-{ID}.json'))
res = d.get('results') or []
good = [r for r in res if r.get('url') and not JUNK.search(r.get('title','')) and not SCARY.search(r.get('title',''))
        and 500 < (r.get('duration') or 0) < 6000]
good.sort(key=lambda r: abs((r.get('duration') or 0) - 2200))
print(f"\n== {ID}: «{TXT}» — подошло {len(good)} из {len(res)}")
for i, r in enumerate(good[:12]):
    print(f"  {i}  {(r.get('duration') or 0)/1000:.1f}с  {r.get('title','')[:58]}  [{r.get('license')}] {r.get('creator','')}")
p = 'scripts/.media-cache/snd.json'
allc = json.load(open(p)) if os.path.exists(p) else {}
allc[ID] = good[:12]
json.dump(allc, open(p, 'w'), ensure_ascii=False, indent=1)
PY
  sleep 4
done
