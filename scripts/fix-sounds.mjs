// Замена неверных звуков и генерация для новых животных.
import fs from 'node:fs';
const KEY=(fs.readFileSync('.env','utf8').match(/ELEVENLABS_API_KEY=(.+)/)||[])[1].trim();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const sfx=JSON.parse(fs.readFileSync('content/sfx-meta.json','utf8'));
const live=JSON.parse(fs.readFileSync('content/sound-meta.json','utf8'));

// Звуки мягкие и короткие: ребёнка 2,8 нельзя пугать рыком в упор.
const JOBS={
  camel:'a soft camel grunt and nasal blow, gentle, close mic',
  tiger:'a soft tiger chuff greeting, friendly puffing breath, not a roar',
  snake:'a gentle snake hiss, soft short sss, close mic',
  warthog:'a warthog snuffling and rooting in dry soil, soft grunts',
  orca:'a distant soft whale blow, spout of air over water',
  lizard:'a tiny lizard scurrying over dry leaves, very soft',
  monitor:'a slow soft reptile hiss, deep and short',
};
let used=0;
for(const [id,prompt] of Object.entries(JOBS)){
  const r=await fetch('https://api.elevenlabs.io/v1/sound-generation',{
    method:'POST',headers:{'xi-api-key':KEY,'Content-Type':'application/json'},
    body:JSON.stringify({text:prompt,duration_seconds:2,prompt_influence:0.6})});
  if(!r.ok){console.log('FAIL',id,r.status,(await r.text()).slice(0,90));await sleep(1200);continue;}
  fs.writeFileSync(`public/media/sounds/${id}.mp3`,Buffer.from(await r.arrayBuffer()));
  sfx[id]={prompt,seconds:2,source:'ElevenLabs sound effects'};
  delete live[id];                       // больше не живая запись
  used+=80;
  console.log('ok',id.padEnd(9),prompt.slice(0,46));
  await sleep(600);
}
fs.writeFileSync('content/sfx-meta.json',JSON.stringify(sfx,null,1));
fs.writeFileSync('content/sound-meta.json',JSON.stringify(live,null,1));
console.log(`\n~${used} кредитов`);
