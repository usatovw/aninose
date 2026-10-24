// Контент для ребёнка 2,8 лет. Ничего мёртвого, пойманного, разделанного и пугающего.
export const UNSAFE = new RegExp([
  'dead','death','died','carcass','carcase','corpse','cadaver','remains',
  'trap','trapped','snare','hunt','hunting','hunter','shot','kill','killed','prey of',
  'roadkill','road kill','butcher','slaughter','meat','carving','skinned','pelt','fur trade',
  'dissect','autopsy','necrops','taxidermy','stuffed','mounted specimen','preserved specimen',
  'skull','skeleton','bone','blood','wound','injur','disease','parasite','infest',
  'cull','abattoir','carrion','decay','rotting','predation','eaten by'
].join('|'), 'i');
export const isSafe = t => !UNSAFE.test(String(t || ''));
