// Для вырезки нужен зверь целиком на простом фоне. Макро-кадры носа
// не вырезаются — у них нет силуэта. Эти фото идут только под вырезку,
// крупный план носа остаётся прежним.
import fs from 'node:fs';
import { isSafe } from './safety.mjs';
const UA='aninose/1.0 (children educational project)';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const Q={
 dog:['dog standing full body studio','dog portrait white background'],
 cat:['cat sitting full body white background','cat standing studio'],
 pig:['pig standing full body','piglet standing white background'],
 guineapig:['guinea pig full body white background','guinea pig sitting studio'],
 lion:['lion standing full body savanna','male lion walking'],
 rhino:['white rhinoceros standing full body','rhinoceros walking side view'],
 anteater:['giant anteater walking full body','anteater standing side'],
 whale:['humpback whale breaching','whale jumping out of water'],
 shark:['great white shark swimming side','shark full body underwater'],
 orca:['orca breaching jumping','killer whale full body'],
 lizard:['green iguana full body','lizard standing side view'],
 moose:['moose standing full body','bull moose walking'],
};
const JUNK=/dead|carcass|trap|hunt|skull|skeleton|taxidermy|meat|blood|dall|midjourney|ai.generated|render|cartoon|vector|illustration|clipart|logo|statue|drawing|diagram/i;
async function ov(q){
  const u=new URL('https://api.openverse.org/v1/images/');
  u.search=new URLSearchParams({q,license:'cc0,by,by-sa',page_size:'20',mature:'false'});
  for(let t=0;t<3;t++){try{
    const c=new AbortController();const to=setTimeout(()=>c.abort(),22000);
    const r=await fetch(u,{headers:{'User-Agent':UA},signal:c.signal});clearTimeout(to);
    if(r.status===429){await sleep(5000);continue;}
    if(!r.ok)return[]; return (await r.json()).results||[];
  }catch{await sleep(2000);}} return [];
}
const out={};
for(const [id,qs] of Object.entries(Q)){
  const seen=new Set(); out[id]=[];
  for(const q of qs){
    for(const x of await ov(q)){
      const t=x.title||'';
      if(!x.url||seen.has(x.url))continue; seen.add(x.url);
      if(!isSafe(t)||JUNK.test(t))continue;
      if((x.width||0)<800)continue;
      out[id].push({title:t,url:x.url,thumb:x.thumbnail||x.url,license:x.license,
        creator:x.creator,page:x.foreign_landing_url,source:x.source});
    }
    await sleep(800);
  }
  out[id]=out[id].slice(0,6);
  console.log(id.padEnd(11),out[id].length);
}
fs.writeFileSync('scripts/.media-cache/full.json',JSON.stringify(out,null,1));
