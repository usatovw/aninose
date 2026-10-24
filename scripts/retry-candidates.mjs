import fs from 'node:fs';
const UA='aninose/1.0 (children educational project; https://github.com/usatovw/aninose)';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const queries=JSON.parse(fs.readFileSync('scripts/retry-queries.json','utf8'));
const all=JSON.parse(fs.readFileSync('scripts/.media-cache/candidates.json','utf8'));
const JUNK=/(montage|collage|composite|diagram|map|skull|skeleton|stamp|coin|logo|chart|icon|statue|painting|drawing|illustration|engraving|museum|specimen|taxidermy|fossil|coat of arms|\.svg|\.pdf|\.tif|lighthouse|portrait of a)/i;
const GOOD=/(head|face|portrait|muzzle|snout|nose|closeup|close.up|detail|macro)/i;
async function search(q,limit=14){
  const u=new URL('https://commons.wikimedia.org/w/api.php');
  u.search=new URLSearchParams({action:'query',format:'json',generator:'search',gsrnamespace:'6',
    gsrlimit:String(limit),gsrsearch:q,prop:'imageinfo',iiprop:'url|extmetadata|mime|size',iiurlwidth:'320'});
  for(let t=0;t<6;t++){const r=await fetch(u,{headers:{'User-Agent':UA}});
    if(r.status===429){await sleep(7000*(t+1));continue;}
    if(!r.ok)return[]; return Object.values((await r.json()).query?.pages||{});}
  return [];
}
for(const [id,q] of Object.entries(queries)){
  const pages=await search(q);
  const cands=[];const seen=new Set();
  for(const p of pages){
    const ii=p.imageinfo?.[0]; if(!ii||!/^image\/(jpeg|png)/.test(ii.mime||''))continue;
    if(JUNK.test(p.title)||seen.has(p.title))continue; seen.add(p.title);
    if((ii.width||0)<500)continue;
    cands.push({title:p.title,thumb:ii.thumburl,url:ii.url,w:ii.width,h:ii.height,
      score:(GOOD.test(p.title)?2:0),
      license:(ii.extmetadata?.LicenseShortName?.value||'').replace(/<[^>]*>/g,''),
      author:(ii.extmetadata?.Artist?.value||'').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim(),
      descUrl:ii.descriptionurl});
  }
  cands.sort((a,b)=>b.score-a.score);
  all[id]=cands.slice(0,6);
  console.log(id.padEnd(17),all[id].length);
  await sleep(1600);
}
fs.writeFileSync('scripts/.media-cache/candidates.json',JSON.stringify(all,null,1));
