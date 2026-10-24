import fs from 'node:fs';
import { isSafe } from './safety.mjs';
const UA='aninose/1.0 (children educational project)';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const meta=JSON.parse(fs.readFileSync('content/photo-meta.json','utf8'));
const AI=/dall|midjourney|stable.diffusion|ai.generated|business suit/i;

async function api(params){
  const u=new URL('https://commons.wikimedia.org/w/api.php');
  u.search=new URLSearchParams({action:'query',format:'json',...params});
  for(let t=0;t<6;t++){const r=await fetch(u,{headers:{'User-Agent':UA}});
    if(r.status===429){await sleep(8000*(t+1));continue;} if(!r.ok)return null; return r.json();}
  return null;
}
async function best(queries){
  for(const q of queries){
    const d=await api({generator:'search',gsrnamespace:'6',gsrlimit:'20',gsrsearch:q,
      prop:'imageinfo',iiprop:'url|extmetadata|mime|size'});
    await sleep(1800);
    const pages=Object.values(d?.query?.pages||{});
    for(const p of pages){
      const ii=p.imageinfo?.[0];
      if(!ii||!/^image\/jpeg/.test(ii.mime||''))continue;
      if(!isSafe(p.title)||AI.test(p.title))continue;
      if((ii.width||0)<800)continue;
      return {title:p.title,
        license:(ii.extmetadata?.LicenseShortName?.value||'').replace(/<[^>]*>/g,''),
        author:(ii.extmetadata?.Artist?.value||'').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim(),
        descUrl:ii.descriptionurl};
    }
  }
  return null;
}
const TARGETS={
  rhino:['Indian rhinoceros head portrait zoo','white rhinoceros head close','rhinoceros muzzle horn head'],
  deer:['Capreolus capreolus roe deer head portrait','roe deer head close up'],
};
for(const [id,qs] of Object.entries(TARGETS)){
  const c=await best(qs);
  if(!c){console.log('no safe candidate for',id);continue;}
  const name=c.title.replace(/^File:/,'').replace(/ /g,'_');
  const r=await fetch(`https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}?width=1400`,
    {headers:{'User-Agent':UA},redirect:'follow'});
  if(!r.ok){console.log('dl fail',id,r.status);continue;}
  fs.writeFileSync(`public/media/photos/${id}.jpg`,Buffer.from(await r.arrayBuffer()));
  meta[id]={file:`${id}.jpg`,commons:name,license:c.license,author:c.author,descUrl:c.descUrl,
            wikipedia:meta[id]?.wikipedia,attributionRequired:!/public domain|^cc0/i.test(c.license)};
  console.log('replaced',id,'->',c.title,'|',c.license);
  await sleep(1000);
}
fs.writeFileSync('content/photo-meta.json',JSON.stringify(meta,null,1));
