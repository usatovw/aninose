// Звук — главный канал для нечитающего ребёнка, поэтому он должен быть надёжным:
// браузер блокирует автозвук до первого касания, голос и звук животного не должны
// перебивать друг друга, а повторные нажатия не должны накладываться слоями.
let unlocked = false;
let currentVoice: HTMLAudioElement | null = null;
let currentSfx: HTMLAudioElement | null = null;
let ctx: AudioContext | null = null;

export const isUnlocked = () => unlocked;

export function unlock() {
  if (unlocked) return;
  unlocked = true;
  try {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    ctx.resume?.();
  } catch { /* без Web Audio обойдёмся */ }
}

function play(src: string, slot: 'voice' | 'sfx', volume = 1): Promise<void> {
  if (!unlocked) return Promise.resolve();
  const prev = slot === 'voice' ? currentVoice : currentSfx;
  if (prev) { prev.pause(); prev.currentTime = 0; }
  const a = new Audio(src);
  a.volume = volume;
  if (slot === 'voice') currentVoice = a; else currentSfx = a;
  return a.play().then(
    () => new Promise<void>(res => { a.onended = () => res(); a.onerror = () => res(); }),
    () => undefined,              // нет файла — молча продолжаем, интерфейс не ломается
  );
}

export const say = (key: string) => play(`/media/voice/${key}.mp3`, 'voice', 1);
export const stopVoice = () => { currentVoice?.pause(); currentVoice = null; };

export function animalSound(id: string) {
  return play(`/media/sounds/${id}.mp3`, 'sfx', 0.85);
}

/** Короткий «пух» при нажатии — тактильная отдача без файлов. */
export function blip(freq = 540) {
  if (!ctx) return;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'sine'; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.14, ctx.currentTime + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
  o.connect(g).connect(ctx.destination);
  o.start(); o.stop(ctx.currentTime + 0.24);
}

/** Голос + звук зверя подряд: сначала кто это, потом как звучит. */
export async function introduce(id: string) {
  await say(`a-${id}-name`);
  await animalSound(id);
}
