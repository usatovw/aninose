import animalsRaw from '../../content/animals.json';
import typesRaw from '../../content/nose-types.json';
import photoMeta from '../../content/photo-meta.json';
import soundMeta from '../../content/sound-meta.json';

export type Palette = { from: string; to: string };
export type Animal = {
  id: string; ru: string; emoji: string; type: string; wiki: string; sound: string;
  kid: string; parent: string; note?: string;
  noseFocus: { x: number; y: number }; palette: Palette;
};
export type NoseType = {
  id: string; name: string; emoji: string; kid: string; why: string; parent: string;
  sources: { title: string; url: string }[]; palette: Palette;
};

export const animals = animalsRaw as Animal[];
export const noseTypes = typesRaw as NoseType[];
export const photos = photoMeta as Record<string, any>;
export const sounds = soundMeta as Record<string, any>;

export const byId = (id?: string) => animals.find(a => a.id === id);
export const typeById = (id?: string) => noseTypes.find(t => t.id === id);
export const animalsOfType = (typeId: string) => animals.filter(a => a.type === typeId);

export const photoUrl = (id: string) => `/media/photos/${id}.jpg`;
export const noseUrl  = (id: string) => `/media/noses/${id}.jpg`;
export const gradient = (p: Palette) => `linear-gradient(160deg, ${p.from} 0%, ${p.to} 100%)`;

/** Русские числительные: «1 носик», «2 носика», «5 носиков». Папа читает вслух. */
export function plural(n: number, one: string, few: string, many: string) {
  const m100 = n % 100, m10 = n % 10;
  if (m100 >= 11 && m100 <= 14) return many;
  if (m10 === 1) return one;
  if (m10 >= 2 && m10 <= 4) return few;
  return many;
}

/**
 * Фото вписывается в квадрат обрезкой по центру (preserveAspectRatio="slice"),
 * поэтому точка носа, заданная в координатах исходного кадра, на экране уезжает.
 * Пересчитываем её в координаты видимого квадрата.
 */
export function displayFocus(id: string, f: { x: number; y: number }) {
  const m: any = (photos as any)[id];
  if (!m?.w || !m?.h) return f;
  const r = m.w / m.h;
  if (r > 1) return { x: (1 - r) / 2 + f.x * r, y: f.y };          // широкое: режутся бока
  if (r < 1) return { x: f.x, y: (1 - 1 / r) / 2 + f.y / r };      // высокое: режется верх и низ
  return f;
}

/** Синонимы: взрослый набирает «кот», «пёс», «кролик», а у нас «Кошка», «Собака», «Зайчик». */
const ALIAS: Record<string, string[]> = {
  cat: ['кот', 'котик', 'киса', 'кошечка'],
  dog: ['пёс', 'пес', 'собачка', 'щенок', 'собачка'],
  horse: ['лошадь', 'конь', 'пони', 'лошадка'],
  rabbit: ['кролик', 'заяц', 'зая'],
  pig: ['свинья', 'поросёнок', 'поросенок', 'хрюшка', 'пятачок'],
  cow: ['корова', 'бычок', 'телёнок', 'теленок', 'му'],
  chicken: ['курица', 'петух', 'цыплёнок', 'цыпленок'],
  duck: ['утка', 'утёнок', 'утенок'],
  mouse: ['мышь'],
  bear: ['мишка', 'медвежонок'],
  fox: ['лиса', 'лис'],
  deer: ['олень'],
  goat: ['коза', 'козёл', 'козел'],
  sheep: ['овца', 'барашек', 'баран'],
  elephant: ['слоник', 'слонёнок', 'слоненок', 'хобот'],
  whale: ['китёнок', 'китенок'],
  snake: ['змея', 'уж'],
  starnosedmole: ['звездочка', 'звёздочка', 'звездорыл'],
  mole: ['крот'],
  hedgehog: ['ёж', 'еж', 'ежик'],
  squirrel: ['белка'],
  guineapig: ['свинка'],
  monkey: ['обезьяна', 'мандрил', 'мандрилл'],
  orca: ['косатка', 'кит-убийца'],
  butterfly: ['мотылёк', 'мотылек'],
  lizard: ['игуана', 'ящерка'],
};
export const aliasesOf = (id: string) => ALIAS[id] || [];
