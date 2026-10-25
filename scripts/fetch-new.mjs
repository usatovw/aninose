import fs from 'node:fs';
import { isSafe } from './safety.mjs';
const UA='aninose/1.0 (children educational project)';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const Q={
 lizard:['lizard head closeup tongue','green lizard face close up'],
 monitor:['monitor lizard head tongue closeup','varanus head close up'],
 desman:['Russian desman Desmana moschata','desman snout'],
 warthog:['warthog head closeup snout','warthog face portrait'],
 orca:['orca blowhole surfacing','killer whale head close up'],
 horse:['horse muzzle nostrils close up','horse nose closeup soft muzzle'],
 squirrel:['red squirrel face closeup nose','squirrel head portrait close up'],
};
const JUNK=/dead|carcass|trap|hunt|skull|skeleton|taxidermy|meat|blood|dall|midjourney|ai.generated|render|cartoon|vector|illustration|clipart|logo|statue|drawing/i;
const GOOD=/nose|snout|muzzle|head|face|portrait|close|macro|tongue|blowhole/i;
async function ov(q){
  const u=new URL('https://api.openverse.org/v1/images/');
  u.search=new URLSearchParams({q,license:'cc0,by,by-sa',page_size:'20',mature:'false'});
  for(let t=0;t<3;t++){try{
    const c=new AbortController();const to=setTimeout(()=>c.abort(),22000);
    const r=await fetch(u,{headers:{'User-Agent':UA},signal:c.signal});clearTimeout(to);
    if(r.status===429){await sleep(5000);continue;}
    if(!r.ok)return[]; return (await r.json()).results||[];
  }catch{await sleep(2000);}}
  return [];
}
async function commons(q){
  const u=new URL('https://commons.wikimedia.org/w/api.php');
  u.search=new URLSearchParams({action:'query',format:'json',generator:'search',gsrnamespace:'6',
    gsrlimit:'15',gsrsearch:q,prop:'imageinfo',iiprop:'url|extmetadata|mime|size',iiurlwidth:'320'});
  for(let t=0;t<4;t++){const r=await fetch(u,{headers:{'User-Agent':UA}});
    if(r.status===429){await sleep(7000);continue;} if(!r.ok)return[];
    return Object.values((await r.json()).query?.pages||{}).map(p=>{
      const ii=p.imageinfo?.[0]||{};
      return {title:p.title,url:ii.url,thumbnail:ii.thumburl,width:ii.width,height:ii.height,
        license:(ii.extmetadata?.LicenseShortName?.value||'').replace(/<[^>]*>/g,''),
        creator:(ii.extmetadata?.Artist?.value||'').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim(),
        foreign_landing_url:ii.descriptionurl, source:'wikimedia', mime:ii.mime};
    });}
  return [];
}
const out={};
for(const [id,qs] of Object.entries(Q)){
  const seen=new Set(); out[id]=[];
  for(const q of qs){
    let res=await ov(q); await sleep(800);
    if(res.length<3){ res=res.concat(await commons(q)); await sleep(1500); }
    for(const x of res){
      const t=x.title||'';
      if(!x.url||seen.has(x.url))continue; seen.add(x.url);
      if(x.mime && !/jpeg|png/.test(x.mime)) continue;
      if(!isSafe(t)||JUNK.test(t))continue;
      if((x.width||0)<700)continue;
      out[id].push({title:t,url:x.url,thumb:x.thumbnail||x.url,license:x.license,
        creator:x.creator,page:x.foreign_landing_url,source:x.source||'openverse',
        score:(GOOD.test(t)?2:0)+((x.width||0)>=1400?1:0)});
    }
  }
  out[id].sort((a,b)=>b.score-a.score);
  out[id]=out[id].slice(0,6);
  console.log(id.padEnd(10),out[id].length);
}
fs.writeFileSync('scripts/.media-cache/new.json',JSON.stringify(out,null,1));
