// Скачивает выбранные вручную фото в полном размере и обновляет photo-meta.
import fs from 'node:fs';
const UA='aninose/1.0 (children educational project; https://github.com/usatovw/aninose)';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const cands=JSON.parse(fs.readFileSync('scripts/.media-cache/candidates.json','utf8'));
const picks=JSON.parse(fs.readFileSync('scripts/picks.json','utf8'));
const meta=JSON.parse(fs.readFileSync('content/photo-meta.json','utf8'));
const OUT='public/media/photos';

for(const [id,sel] of Object.entries(picks)){
  if(sel==='KEEP'){ console.log('keep ',id); continue; }
  const idx=parseInt(String(sel).replace(/^[rf]/,''),10);
  const c=cands[id]?.[idx];
  if(!c){ console.log('MISS ',id,sel); continue; }
  // тянем версию шириной 1400 через Special:FilePath — не грузим оригинал на 20 МБ
  const name=c.title.replace(/^File:/,'').replace(/ /g,'_');
  const url=`https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}?width=1400`;
  try{
    const r=await fetch(url,{headers:{'User-Agent':UA},redirect:'follow'});
    if(!r.ok){ console.log('DL   ',id,r.status); continue; }
    fs.writeFileSync(`${OUT}/${id}.jpg`, Buffer.from(await r.arrayBuffer()));
    meta[id]={file:`${id}.jpg`, commons:name, license:c.license||'unknown',
      author:c.author||'unknown', descUrl:c.descUrl, wikipedia:meta[id]?.wikipedia,
      attributionRequired: !/public domain|^cc0/i.test(c.license||'')};
    console.log('ok   ',id.padEnd(16),(c.license||'?').padEnd(16),c.title.slice(0,46));
  }catch(e){ console.log('FAIL ',id,e.message); }
  await sleep(700);
}
fs.writeFileSync('content/photo-meta.json',JSON.stringify(meta,null,1));
