// Точечный поиск макро-кадров носа по Викискладу: у части зверей
// нос не читается ни на общем плане, ни на прежнем близком кадре.
import fs from 'node:fs';
import { isSafe } from './safety.mjs';
const UA='aninose/1.0 (children educational project; github.com/usatovw/aninose)';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const OUT='scripts/.media-cache/noses.json';
const BAD=/skull|skelet|specimen|dead|carcass|hunt|trap|anatom|diagram|chart|drawing|illustration|engraving|statue|taxiderm/i;
async function api(params){
  const u=new URL('https://commons.wikimedia.org/w/api.php');
  u.search=new URLSearchParams({...params,format:'json',origin:'*'});
  for(let t=0;t<3;t++){
    try{ const c=new AbortController(); const to=setTimeout(()=>c.abort(),25000);
      const r=await fetch(u,{headers:{'User-Agent':UA},signal:c.signal}); clearTimeout(to);
      if(r.ok) return await r.json(); }catch{} await sleep(2000);
  } return null;
}
const out=fs.existsSync(OUT)?JSON.parse(fs.readFileSync(OUT,'utf8')):{};
for(const arg of process.argv.slice(2)){
  const [id,...q]=arg.split('|'); const query=q.join(' ');
  const m=await api({action:'query',generator:'search',gsrsearch:`filetype:bitmap ${query}`,
    gsrnamespace:'6',gsrlimit:'40',prop:'imageinfo',iiprop:'url|size|extmetadata',iiurlwidth:'420'});
  const list=[];
  for(const p of Object.values(m?.query?.pages||{})){
    const ii=p.imageinfo?.[0]; if(!ii) continue;
    const t=(p.title||'').replace(/^File:/,'');
    if(!/\.(jpe?g|png)$/i.test(t)||!isSafe(t)||BAD.test(t)) continue;
    if((ii.width||0)<700||(ii.height||0)<500) continue;
    const em=ii.extmetadata||{};
    list.push({title:t,url:ii.url.split('?')[0],thumb:ii.thumburl||ii.url,w:ii.width,h:ii.height,
      license:(em.LicenseShortName?.value||'').replace(/<[^>]+>/g,''),
      author:(em.Artist?.value||'').replace(/<[^>]+>/g,'').trim().slice(0,90),
      page:ii.descriptionurl,source:'commons'});
  }
  out[id]=list.slice(0,24);
  console.log(id.padEnd(12),query.padEnd(30),out[id].length);
  fs.writeFileSync(OUT,JSON.stringify(out,null,1));
  await sleep(600);
}
