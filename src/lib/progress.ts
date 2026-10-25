// Альбом носиков. Пишем и в localStorage (мгновенно, работает офлайн),
// и на сервер (чтобы альбом жил между устройствами). Сервер не обязателен.
const KEY = 'aninose.seen.v1';

const read = (): string[] => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
};
const write = (ids: string[]) => {
  try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch { /* приватный режим */ }
};

export const seen = () => new Set(read());

export function markSeen(id: string) {
  const ids = read();
  if (ids.includes(id)) return false;
  ids.push(id); write(ids);
  fetch('/api/progress', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  }).catch(() => { /* офлайн — localStorage уже сохранил */ });
  return true;
}

/**
 * Альбом намеренно читается только из localStorage.
 * Серверный список общий на всех посетителей — вливать его значит
 * заполнять альбом ребёнка чужими находками.
 */
export async function syncFromServer() { /* no-op */ }
