import fs from 'node:fs';
import { isSafe } from '/home/user/aninose/scripts/safety.mjs';
const UA='aninose/1.0 (children educational project)';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const meta=JSON.parse(fs.readFileSync('content/photo-meta.json','utf8'));
const AI=/dall|midjourney|stable.diffusion|ai.generated|business suit/i;
async function pick(queries){
  for(const q of queries){
    const u=new URL('https://commons.wikimedia.org/w/api.php');
    u.search=new URLSearchParams({action:'query',format:'json',generator:'search',gsrnamespace:'6',
      gsrlimit:'20',gsrsearch:q,prop:'imageinfo',iiprop:'url|extmetadata|mime|size'});
    let d=null;
    for(let t=0;t<5;t++){const r=await fetch(u,{headers:{'User-Agent':UA}});
      if(r.status===429){await sleep(8000*(t+1));continue;} if(r.ok)d=await r.json(); break;}
    await sleep(1800);
    for(const p of Object.values(d?.query?.pages||{})){
      const ii=p.imageinfo?.[0];
      if(!ii||!/^image\/jpeg/.test(ii.mime||''))continue;
      if(!isSafe(p.title)||AI.test(p.title))continue;
      if((ii.width||0)<800||(ii.width/ii.height)>1.8)continue;
      return {title:p.title,license:(ii.extmetadata?.LicenseShortName?.value||'').replace(/<[^>]*>/g,''),
        author:(ii.extmetadata?.Artist?.value||'').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim(),
        descUrl:ii.descriptionurl};
    }
  }
  return null;
}
const T={moose:['Alces alces bull moose head portrait','moose head close up muzzle'],
         rhino:['Diceros bicornis head close up','rhinoceros head portrait close']};
for(const [id,qs] of Object.entries(T)){
  const c=await pick(qs); if(!c){console.log('none',id);continue;}
  const name=c.title.replace(/^File:/,'').replace(/ /g,'_');
  const r=await fetch(`https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}?width=1200`,{headers:{'User-Agent':UA},redirect:'follow'});
  if(!r.ok){console.log('dl',id,r.status);continue;}
  fs.writeFileSync(`public/media/photos/${id}.jpg`,Buffer.from(await r.arrayBuffer()));
  meta[id]={file:`${id}.jpg`,commons:name,license:c.license,author:c.author,descUrl:c.descUrl,
    wikipedia:meta[id]?.wikipedia,attributionRequired:!/public domain|^cc0/i.test(c.license)};
  console.log('replaced',id,'->',c.title);
}
fs.writeFileSync('content/photo-meta.json',JSON.stringify(meta,null,1));
