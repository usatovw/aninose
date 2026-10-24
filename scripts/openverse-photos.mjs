// Фото через Openverse: индексирует Flickr CC + Викисклад + rawpixel.
// Пул кратно больше и качество выше, чем у одного Викисклада.
import fs from 'node:fs';
import { isSafe } from './safety.mjs';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const UA='aninose/1.0 (children educational project; github.com/usatovw/aninose)';
const animals=JSON.parse(fs.readFileSync('content/animals.json','utf8'));

// Что именно ищем для каждого: крупный план носа конкретного вида.
const Q=JSON.parse(fs.readFileSync('scripts/photo-queries.json','utf8'));
const GOOD=/(nose|snout|muzzle|head|face|portrait|close|macro|trunk|beak|bill|nostril|tentacle|whisker)/i;
const AI=/dall|midjourney|stable.?diffusion|ai.generated|generated|render|3d|illustration|clipart|cartoon|drawing|vector/i;

async function search(q,page=1){
  const u=new URL('https://api.openverse.org/v1/images/');
  u.search=new URLSearchParams({q,license:'cc0,by,by-sa',page_size:'20',page:String(page),
                                mature:'false'});
  for(let t=0;t<4;t++){
    try{
      const c=new AbortController(); const to=setTimeout(()=>c.abort(),25000);
      const r=await fetch(u,{headers:{'User-Agent':UA},signal:c.signal}); clearTimeout(to);
      if(r.status===429){await sleep(5000*(t+1));continue;}
      if(!r.ok) return [];
      return (await r.json()).results||[];
    }catch{ await sleep(2500); }
  }
  return [];
}
const out={};
for(const a of animals){
  const queries=Q[a.id]||[`${a.wiki} nose close up`,`${a.wiki} head portrait`];
  const seen=new Set(); const cands=[];
  for(const q of queries){
    for(const r of await search(q)){
      const title=r.title||'';
      if(!r.url||seen.has(r.url))continue; seen.add(r.url);
      if(!isSafe(title)||AI.test(title))continue;
      const w=r.width||0,h=r.height||0;
      if(w<700||h<500)continue;
      cands.push({title,url:r.url,thumb:r.thumbnail||r.url,w,h,
        license:r.license,lv:r.license_version,creator:r.creator,
        source:r.source,page:r.foreign_landing_url,
        score:(GOOD.test(title)?3:0)+(w>=1500?1:0)+(r.source==='flickr'?1:0)});
    }
    await sleep(900);
  }
  cands.sort((x,y)=>y.score-x.score||y.w-x.w);
  out[a.id]=cands.slice(0,6);
  console.log(a.id.padEnd(16),out[a.id].length);
  fs.writeFileSync('scripts/.media-cache/ov.json',JSON.stringify(out,null,1));
}
