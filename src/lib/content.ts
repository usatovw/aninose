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
