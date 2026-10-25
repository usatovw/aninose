// Звук — главный канал для нечитающего ребёнка, поэтому он должен быть надёжным:
// браузер блокирует автозвук до первого касания, голос и звук животного не должны
// перебивать друг друга, а повторные нажатия не должны накладываться слоями.
let unlocked = false;
let blocked = false;
const blockedListeners = new Set<(v: boolean) => void>();
export const isBlocked = () => blocked;
export function onBlocked(fn: (v: boolean) => void) {
  blockedListeners.add(fn);
  return () => { blockedListeners.delete(fn); };
}
function setBlocked(v: boolean) {
  if (blocked === v) return;
  blocked = v;
  blockedListeners.forEach(f => f(v));
}
let currentVoice: HTMLAudioElement | null = null;
let currentSfx: HTMLAudioElement | null = null;
let ctx: AudioContext | null = null;

export const isUnlocked = () => unlocked;

export function unlock() {
  if (unlocked) return;
  setBlocked(false);
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
    () => { setBlocked(false);
            return new Promise<void>(res => { a.onended = () => res(); a.onerror = () => res(); }); },
    (err: any) => {
      // NotAllowedError — браузер не пустил звук без жеста: об этом надо сказать вслух,
      // иначе ребёнок остаётся с немым приложением и не понимает почему
      if (err && err.name === 'NotAllowedError') setBlocked(true);
      return undefined;
    },
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

/**
 * Автоозвучка надоедает: первые разы она объясняет правила игры,
 * дальше начинает мешать. После трёх раз за сеанс замолкаем и ждём кнопку.
 */
const AUTO_LIMIT = 3;
let autoPlays = 0;
export const autoPlaysLeft = () => Math.max(0, AUTO_LIMIT - autoPlays);
export const noteAutoPlay = () => { autoPlays += 1; };
export function resetAutoPlays() { autoPlays = 0; }

/**
 * Знакомство: кто это -> как звучит -> что у него за нос.
 * Третий шаг обязателен: ребёнок не читает, и без него содержание страницы
 * не доходит до него вообще.
 */
export async function introduce(id: string, signal?: { cancelled: boolean }) {
  await say(`a-${id}-name`);
  if (signal?.cancelled) return;
  await animalSound(id);
  if (signal?.cancelled) return;
  await say(`a-${id}-kid`);
}
