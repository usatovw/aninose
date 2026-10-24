// Третий проход: тянем из конкретных категорий Викисклада (надёжнее поиска).
import fs from 'node:fs';
const UA='aninose/1.0 (children educational project; https://github.com/usatovw/aninose)';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const all=JSON.parse(fs.readFileSync('scripts/.media-cache/candidates.json','utf8'));
const CATS={
 rabbit:['Category:Heads of rabbits','Category:Oryctolagus cuniculus'],
 boar:['Category:Heads of Sus scrofa','Category:Sus scrofa in Germany'],
 tapir:['Category:Tapirus terrestris','Category:Tapirus indicus'],
 seal:['Category:Phoca vitulina','Category:Heads of pinnipeds'],
 fish:['Category:Heads of fish','Category:Cyprinus carpio'],
 hamster:['Category:Mesocricetus auratus','Category:Phodopus'],
 saiga:['Category:Saiga tatarica'],
 bee:['Category:Heads of Apis mellifera','Category:Apis mellifera'],
 kiwi:['Category:Apteryx'],
 wolf:['Category:Heads of Canis lupus','Category:Canis lupus in zoos'],
 lion:['Category:Heads of lions'],
 snail:['Category:Helix pomatia'],
 pig:['Category:Heads of pigs','Category:Snouts of pigs'],
};
const JUNK=/(montage|collage|composite|diagram|map|skull|skeleton|stamp|coin|logo|statue|painting|drawing|illustration|engraving|museum|taxidermy|fossil|\.svg|\.pdf|\.tif)/i;
async function members(cat,limit=25){
  const u=new URL('https://commons.wikimedia.org/w/api.php');
  u.search=new URLSearchParams({action:'query',format:'json',generator:'categorymembers',
    gcmtitle:cat,gcmtype:'file',gcmlimit:String(limit),
    prop:'imageinfo',iiprop:'url|extmetadata|mime|size',iiurlwidth:'320'});
  for(let t=0;t<6;t++){const r=await fetch(u,{headers:{'User-Agent':UA}});
    if(r.status===429){await sleep(7000*(t+1));continue;}
    if(!r.ok)return[]; return Object.values((await r.json()).query?.pages||{});}
  return [];
}
for(const [id,cats] of Object.entries(CATS)){
  const out=[];const seen=new Set();
  for(const c of cats){
    for(const p of await members(c)){
      const ii=p.imageinfo?.[0]; if(!ii||!/^image\/(jpeg|png)/.test(ii.mime||''))continue;
      if(JUNK.test(p.title)||seen.has(p.title))continue; seen.add(p.title);
      if((ii.width||0)<600)continue;
      out.push({title:p.title,thumb:ii.thumburl,url:ii.url,w:ii.width,h:ii.height,
        license:(ii.extmetadata?.LicenseShortName?.value||'').replace(/<[^>]*>/g,''),
        author:(ii.extmetadata?.Artist?.value||'').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim(),
        descUrl:ii.descriptionurl});
    }
    await sleep(1500);
  }
  if(out.length){ all[id]=out.slice(0,6); }
  console.log(id.padEnd(16), out.length);
}
fs.writeFileSync('scripts/.media-cache/candidates.json',JSON.stringify(all,null,1));
