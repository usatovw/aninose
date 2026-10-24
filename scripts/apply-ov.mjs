// Применяет вручную отобранные кадры Openverse. Остальные животные
// остаются на уже проверенных фото с Викисклада.
import fs from 'node:fs';
const ov=JSON.parse(fs.readFileSync('scripts/.media-cache/ov.json','utf8'));
const meta=JSON.parse(fs.readFileSync('content/photo-meta.json','utf8'));
const PICK=JSON.parse(process.argv[2]);
const UA='aninose/1.0 (children educational project)';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
for(const [id,i] of Object.entries(PICK)){
  const c=ov[id]?.[i];
  if(!c){ console.log('MISS',id,i); continue; }
  try{
    const r=await fetch(c.url,{headers:{'User-Agent':UA},redirect:'follow'});
    if(!r.ok){ console.log('DL',id,r.status); continue; }
    fs.writeFileSync(`public/media/photos/${id}.jpg`,Buffer.from(await r.arrayBuffer()));
    meta[id]={file:`${id}.jpg`,commons:c.title,license:`${String(c.license).toUpperCase()}${c.lv?' '+c.lv:''}`,
      author:c.creator||'unknown',descUrl:c.page,wikipedia:meta[id]?.wikipedia,source:c.source,
      attributionRequired:!/cc0/i.test(c.license)};
    console.log('ok',id.padEnd(16),String(c.license).toUpperCase().padEnd(6),(c.title||'').slice(0,42));
  }catch(e){ console.log('FAIL',id,e.message); }
  await sleep(350);
}
fs.writeFileSync('content/photo-meta.json',JSON.stringify(meta,null,1));
