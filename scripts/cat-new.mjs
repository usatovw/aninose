import fs from 'node:fs';
import { isSafe } from '/home/user/aninose/scripts/safety.mjs';
const UA='aninose/1.0 (children educational project)';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const all=JSON.parse(fs.readFileSync('scripts/.media-cache/new.json','utf8'));
const CATS={warthog:['Category:Phacochoerus africanus','Category:Heads of Phacochoerus'],
            horse:['Category:Heads of horses','Category:Muzzles of horses'],
            squirrel:['Category:Heads of Sciurus','Category:Sciurus vulgaris in Germany']};
const JUNK=/dead|carcass|trap|hunt|skull|skeleton|taxidermy|meat|blood|statue|drawing|illustration|\.svg/i;
async function members(cat){
  const u=new URL('https://commons.wikimedia.org/w/api.php');
  u.search=new URLSearchParams({action:'query',format:'json',generator:'categorymembers',gcmtitle:cat,
    gcmtype:'file',gcmlimit:'30',prop:'imageinfo',iiprop:'url|extmetadata|mime|size',iiurlwidth:'320'});
  for(let t=0;t<5;t++){const r=await fetch(u,{headers:{'User-Agent':UA}});
    if(r.status===429){await sleep(7000*(t+1));continue;} if(!r.ok)return[];
    return Object.values((await r.json()).query?.pages||{});}
  return[];
}
for(const [id,cats] of Object.entries(CATS)){
  const out=[];const seen=new Set();
  for(const c of cats){ for(const p of await members(c)){
    const ii=p.imageinfo?.[0]; if(!ii||!/^image\/(jpeg|png)/.test(ii.mime||''))continue;
    if(JUNK.test(p.title)||!isSafe(p.title)||seen.has(p.title))continue; seen.add(p.title);
    if((ii.width||0)<800)continue;
    out.push({title:p.title,url:ii.url,thumb:ii.thumburl,
      license:(ii.extmetadata?.LicenseShortName?.value||'').replace(/<[^>]*>/g,''),
      creator:(ii.extmetadata?.Artist?.value||'').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim(),
      page:ii.descriptionurl,source:'wikimedia'});} await sleep(1500);}
  if(out.length) all[id]=out.slice(0,6);
  console.log(id,out.length);
}
fs.writeFileSync('scripts/.media-cache/new.json',JSON.stringify(all,null,1));
