import fs from 'node:fs';
const UA='aninose/1.0 (children educational project)';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const c=JSON.parse(fs.readFileSync('scripts/.media-cache/new.json','utf8'));
const meta=JSON.parse(fs.readFileSync('content/photo-meta.json','utf8'));
const PICK=JSON.parse(process.argv[2]);
for(const [id,i] of Object.entries(PICK)){
  const x=c[id]?.[i]; if(!x){console.log('MISS',id);continue;}
  try{
    const r=await fetch(x.url,{headers:{'User-Agent':UA},redirect:'follow'});
    if(!r.ok){console.log('DL',id,r.status);continue;}
    fs.writeFileSync(`public/media/photos/${id}.jpg`,Buffer.from(await r.arrayBuffer()));
    meta[id]={file:`${id}.jpg`,commons:x.title,license:String(x.license||'').toUpperCase(),
      author:x.creator||'unknown',descUrl:x.page,source:x.source,
      attributionRequired:!/cc0|public domain/i.test(x.license||'')};
    console.log('ok',id.padEnd(10),String(x.license).toUpperCase().padEnd(14),(x.title||'').slice(0,46));
  }catch(e){console.log('FAIL',id,e.message);}
  await sleep(400);
}
fs.writeFileSync('content/photo-meta.json',JSON.stringify(meta,null,1));
