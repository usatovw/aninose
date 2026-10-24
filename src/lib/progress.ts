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

export async function syncFromServer() {
  try {
    const r = await fetch('/api/progress');
    if (!r.ok) return;
    const { ids } = await r.json();
    if (!Array.isArray(ids)) return;
    const merged = Array.from(new Set([...read(), ...ids]));
    write(merged);
  } catch { /* не критично */ }
}
