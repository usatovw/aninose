import fs from 'node:fs';
import { isSafe } from './safety.mjs';
const UA='aninose/1.0 (children educational project)';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const meta=JSON.parse(fs.readFileSync('content/photo-meta.json','utf8'));
const AI=/dall|midjourney|stable.diffusion|ai.generated|business suit|generated/i;
const want=JSON.parse(process.argv[2]);
async function cands(queries,cat){
  const out=[];const seen=new Set();
  for(const q of queries){
    const u=new URL('https://commons.wikimedia.org/w/api.php');
    const base={action:'query',format:'json',prop:'imageinfo',iiprop:'url|extmetadata|mime|size',iiurlwidth:'320'};
    u.search=new URLSearchParams(cat?{...base,generator:'categorymembers',gcmtitle:q,gcmtype:'file',gcmlimit:'30'}
                                     :{...base,generator:'search',gsrnamespace:'6',gsrlimit:'20',gsrsearch:q});
    let d=null;
    for(let t=0;t<5;t++){const r=await fetch(u,{headers:{'User-Agent':UA}});
      if(r.status===429){await sleep(8000*(t+1));continue;} if(r.ok)d=await r.json(); break;}
    await sleep(1600);
    for(const p of Object.values(d?.query?.pages||{})){
      const ii=p.imageinfo?.[0]; if(!ii||!/^image\/jpeg/.test(ii.mime||''))continue;
      if(!isSafe(p.title)||AI.test(p.title)||seen.has(p.title))continue; seen.add(p.title);
      if((ii.width||0)<700)continue;
      out.push({title:p.title,thumb:ii.thumburl,
        license:(ii.extmetadata?.LicenseShortName?.value||'').replace(/<[^>]*>/g,''),
        author:(ii.extmetadata?.Artist?.value||'').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim(),
        descUrl:ii.descriptionurl});
    }
  }
  return out.slice(0,6);
}
const res={};
for(const [id,spec] of Object.entries(want)) res[id]=await cands(spec.q, spec.cat);
fs.writeFileSync('/tmp/refetch.json',JSON.stringify(res,null,1));
for(const k of Object.keys(res)) console.log(k,res[k].length);
