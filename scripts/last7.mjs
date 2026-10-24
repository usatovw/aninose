import fs from 'node:fs';
import { isSafe } from '/home/user/aninose/scripts/safety.mjs';
const UA='aninose/1.0 (kids edu)'; const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const meta=JSON.parse(fs.readFileSync('content/photo-meta.json','utf8'));
const Q={dog:['dog nose macro wet','dog muzzle closeup black nose'],
 squirrel:['squirrel face closeup nose','red squirrel head portrait'],
 boar:['wild boar head closeup snout','boar face portrait'],
 zebra:['zebra muzzle nose closeup','zebra head closeup face'],
 rhino:['rhino nose horn closeup','rhinoceros face closeup muzzle'],
 seal:['seal face closeup nose whiskers','grey seal head portrait'],
 kiwi:['kiwi bird closeup beak head','apteryx closeup']};
const MUST=/(nose|snout|muzzle|head|face|portrait|closeup|close.up|macro|beak)/i;
const AI=/dall|midjourney|ai.generated|render|cartoon|vector|illustration/i;
async function s(q){
  const u=new URL('https://api.openverse.org/v1/images/');
  u.search=new URLSearchParams({q,license:'cc0,by,by-sa',page_size:'20',mature:'false'});
  for(let t=0;t<3;t++){ try{
    const c=new AbortController(); const to=setTimeout(()=>c.abort(),20000);
    const r=await fetch(u,{headers:{'User-Agent':UA},signal:c.signal}); clearTimeout(to);
    if(r.status===429){await sleep(4000);continue;} if(!r.ok)return[];
    return (await r.json()).results||[];
  }catch{await sleep(1500);} } return [];
}
for(const [id,qs] of Object.entries(Q)){
  let best=null;
  for(const q of qs){
    for(const r of await s(q)){
      const t=r.title||'';
      if(!MUST.test(t)||AI.test(t)||!isSafe(t))continue;
      if((r.width||0)<900)continue;
      if(!best||(r.width||0)>(best.width||0)) best=r;
    }
    await sleep(900);
    if(best) break;
  }
  if(!best){ console.log('none',id); continue; }
  const bin=await fetch(best.url,{headers:{'User-Agent':UA},redirect:'follow'});
  if(!bin.ok){ console.log('dl',id,bin.status); continue; }
  fs.writeFileSync(`public/media/photos/${id}.jpg`,Buffer.from(await bin.arrayBuffer()));
  meta[id]={file:`${id}.jpg`,commons:best.title,license:String(best.license).toUpperCase(),
    author:best.creator||'unknown',descUrl:best.foreign_landing_url,source:best.source,
    wikipedia:meta[id]?.wikipedia,attributionRequired:!/cc0/i.test(best.license)};
  console.log('ok',id.padEnd(10),String(best.license).toUpperCase().padEnd(6),best.title.slice(0,44));
  await sleep(500);
}
fs.writeFileSync('content/photo-meta.json',JSON.stringify(meta,null,1));
