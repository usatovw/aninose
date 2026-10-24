// Звуки для тех животных, у кого нет живой CC0-записи.
// ElevenLabs sound effects: 40 кредитов за секунду, берём ровно 2 сек.
import fs from 'node:fs';
const KEY=(fs.readFileSync('.env','utf8').match(/ELEVENLABS_API_KEY=(.+)/)||[])[1]?.trim();
const animals=JSON.parse(fs.readFileSync('content/animals.json','utf8'));
const have=JSON.parse(fs.readFileSync('content/sound-meta.json','utf8'));
const SFX='content/sfx-meta.json';
const sfx=fs.existsSync(SFX)?JSON.parse(fs.readFileSync(SFX,'utf8')):{};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

// Описания для генератора: короткий, мягкий, узнаваемый звук. Никакого рёва в упор — ребёнку 2,8.
const PROMPTS={
 chicken:'a single gentle chicken cluck, farmyard hen, clean recording',
 rabbit:'soft rabbit thumping and quiet sniffing, small animal',
 bear:'a low soft bear huff and grunt, calm not aggressive',
 wolf:'a short gentle wolf howl, distant and soft',
 fox:'a short fox bark call in a quiet forest',
 deer:'a soft deer bleat call, gentle',
 moose:'a low soft moose grunt call',
 boar:'wild boar snuffling and rooting in soil, soft grunts',
 giraffe:'a soft giraffe hum and snort, gentle breathing',
 zebra:'a short zebra bark bray call',
 hippo:'a deep soft hippo grunt, playful not scary',
 monkey:'a gentle monkey chatter call, soft and playful',
 gorilla:'a soft gorilla chest hum and grunt, calm',
 proboscismonkey:'a soft honking monkey call, nasal and funny',
 ostrich:'a low soft ostrich boom call',
 starnosedmole:'tiny mole snuffling and scratching in wet soil, very soft',
 tapir:'a soft high tapir whistle call, short',
 anteater:'an anteater sniffing with long snout, soft snuffling',
 saiga:'a short soft antelope snort through the nose',
 platypus:'a small aquatic animal gently splashing water',
 echidna:'a small spiny animal snuffling in dirt, soft',
 whale:'a distant gentle whale blow, spout of air, soft',
 seal:'a soft seal bark call, gentle',
 walrus:'a soft walrus grunt, deep and gentle',
 shark:'a smooth underwater whoosh of a large fish swimming past',
 fish:'gentle underwater bubbles, soft and calm',
 kiwi:'a small bird snuffling in soil, soft sniffing',
 butterfly:'very soft delicate fluttering of butterfly wings',
 snail:'a very soft wet slithering sound, tiny and gentle',
 beaver:'a beaver gnawing wood softly and a small water splash',
 mole:'a small mole digging in soil, soft snuffling',
 crocodile:'a low soft crocodile hiss, gentle',
};
let used=0, made=0;
for(const a of animals){
  if(have[a.id]) continue;
  if(fs.existsSync(`public/media/sounds/${a.id}.mp3`)) continue;
  const prompt=PROMPTS[a.id] || `a gentle short natural sound of a ${a.wiki}, soft and child friendly`;
  const r=await fetch('https://api.elevenlabs.io/v1/sound-generation',{
    method:'POST',headers:{'xi-api-key':KEY,'Content-Type':'application/json'},
    body:JSON.stringify({text:prompt,duration_seconds:2,prompt_influence:0.6}),
  });
  if(!r.ok){ console.log('FAIL',a.id,r.status,(await r.text()).slice(0,100)); await sleep(1200); continue; }
  fs.writeFileSync(`public/media/sounds/${a.id}.mp3`,Buffer.from(await r.arrayBuffer()));
  sfx[a.id]={prompt,seconds:2,source:'ElevenLabs sound effects'};
  used+=80; made++;
  fs.writeFileSync(SFX,JSON.stringify(sfx,null,1));
  console.log('sfx  ',a.id.padEnd(16),prompt.slice(0,46));
  await sleep(600);
}
console.log(`\ngenerated ${made} sfx, ~${used} credits`);
