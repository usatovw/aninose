// Явная замена конкретными файлами, отобранными глазами на контактных листах.
import fs from 'node:fs';
const UA='aninose/1.0 (children educational project)';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const meta=JSON.parse(fs.readFileSync('content/photo-meta.json','utf8'));
const CHOSEN=JSON.parse(process.argv[2]);
for(const [id,title] of Object.entries(CHOSEN)){
  const name=title.replace(/^File:/,'').replace(/ /g,'_');
  const q=new URL('https://commons.wikimedia.org/w/api.php');
  q.search=new URLSearchParams({action:'query',format:'json',titles:'File:'+name.replace(/_/g,' '),
    prop:'imageinfo',iiprop:'url|extmetadata'});
  const d=await (await fetch(q,{headers:{'User-Agent':UA}})).json();
  const p=Object.values(d.query?.pages||{})[0]; const em=p?.imageinfo?.[0]?.extmetadata||{};
  const r=await fetch(`https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}?width=1200`,
    {headers:{'User-Agent':UA},redirect:'follow'});
  if(!r.ok){console.log('dl fail',id,r.status);continue;}
  fs.writeFileSync(`public/media/photos/${id}.jpg`,Buffer.from(await r.arrayBuffer()));
  const lic=(em.LicenseShortName?.value||'').replace(/<[^>]*>/g,'');
  meta[id]={file:`${id}.jpg`,commons:name,license:lic||'unknown',
    author:(em.Artist?.value||'').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim()||'unknown',
    descUrl:p?.imageinfo?.[0]?.descriptionurl,wikipedia:meta[id]?.wikipedia,
    attributionRequired:!/public domain|^cc0/i.test(lic)};
  console.log('replaced',id,'->',title,'|',lic);
  await sleep(900);
}
fs.writeFileSync('content/photo-meta.json',JSON.stringify(meta,null,1));
