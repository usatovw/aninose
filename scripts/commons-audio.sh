#!/bin/sh
# Звуки животных на Викискладе: там есть полевые записи, которых нет в Openverse.
for Q in "$@"; do
  ID=${Q%%|*}; TXT=${Q#*|}
  curl -s --get "https://commons.wikimedia.org/w/api.php" \
    --data-urlencode "action=query" --data-urlencode "format=json" \
    --data-urlencode "generator=search" --data-urlencode "gsrsearch=filetype:audio $TXT" \
    --data-urlencode "gsrnamespace=6" --data-urlencode "gsrlimit=30" \
    --data-urlencode "prop=imageinfo" --data-urlencode "iiprop=url|size|extmetadata" \
    -H "User-Agent: aninose/1.0 (kids education)" > "/tmp/ca-$ID.json"
  python3 - "$ID" "$TXT" <<'PY'
import json, re, sys, os
ID, TXT = sys.argv[1], sys.argv[2]
SCARY = re.compile(r'(angry|aggress|attack|growl|snarl|scream|screech|roar|hiss|fight|distress|alarm|pain|kill|hunt|shot|gun)', re.I)
d = json.load(open(f'/tmp/ca-{ID}.json'))
pages = list((d.get('query') or {}).get('pages', {}).values())
out = []
for p in pages:
    ii = (p.get('imageinfo') or [{}])[0]
    t = (p.get('title') or '').replace('File:', '')
    if not re.search(r'\.(ogg|oga|wav|mp3|flac)$', t, re.I): continue
    if SCARY.search(t): continue
    em = ii.get('extmetadata') or {}
    out.append({'title': t, 'url': ii.get('url'), 'page': ii.get('descriptionurl'),
                'license': re.sub('<[^>]+>', '', (em.get('LicenseShortName') or {}).get('value', '')),
                'author': re.sub('<[^>]+>', '', (em.get('Artist') or {}).get('value', ''))[:50]})
print(f"\n== {ID}: «{TXT}» — {len(out)} шт")
for i, r in enumerate(out[:14]):
    print(f"  {i}  {r['title'][:62]}  [{r['license']}]")
p = 'scripts/.media-cache/casnd.json'
allc = json.load(open(p)) if os.path.exists(p) else {}
allc[ID] = out
json.dump(allc, open(p, 'w'), ensure_ascii=False, indent=1)
PY
  sleep 2
done
