/**
 * Свой набор иконок. Эмодзи не используем: они выглядят как заглушки,
 * по-разному рисуются на разных системах и ломают единый стиль.
 * Линии толстые и скруглённые — читается с расстояния и ребёнком, и взрослым.
 */
type P = { size?: number; color?: string };
const base = (size: number) => ({
  width: size, height: size, viewBox: '0 0 32 32', fill: 'none',
  strokeWidth: 3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
});

export const IconBack = ({ size = 30, color = 'currentColor' }: P) => (
  <svg {...base(size)} stroke={color}><path d="M19 7 10 16l9 9" /></svg>
);
export const IconHome = ({ size = 30, color = 'currentColor' }: P) => (
  <svg {...base(size)} stroke={color}><path d="M5 14 16 5l11 9" /><path d="M8 13v12h16V13" /></svg>
);
export const IconSound = ({ size = 30, color = 'currentColor' }: P) => (
  <svg {...base(size)} stroke={color}>
    <path d="M6 12h4l6-5v18l-6-5H6z" /><path d="M21 11c1.8 1.6 1.8 8.4 0 10" />
  </svg>
);
export const IconPlay = ({ size = 30, color = 'currentColor' }: P) => (
  <svg {...base(size)} stroke={color} fill={color}><path d="M11 7l13 9-13 9z" /></svg>
);
export const IconMedal = ({ size = 30, color = 'currentColor' }: P) => (
  <svg {...base(size)} stroke={color}>
    <path d="M11 5h10l-2.5 8h-5z" /><circle cx="16" cy="20" r="7" />
    <path d="m16 17 1.2 2.4 2.6.4-1.9 1.8.45 2.6L16 23l-2.35 1.2.45-2.6-1.9-1.8 2.6-.4z" fill={color} stroke="none" />
  </svg>
);
export const IconDice = ({ size = 30, color = 'currentColor' }: P) => (
  <svg {...base(size)} stroke={color}>
    <rect x="5" y="5" width="22" height="22" rx="7" />
    <circle cx="11.5" cy="11.5" r="2.1" fill={color} stroke="none" />
    <circle cx="20.5" cy="20.5" r="2.1" fill={color} stroke="none" />
    <circle cx="20.5" cy="11.5" r="2.1" fill={color} stroke="none" />
  </svg>
);
export const IconNext = ({ size = 30, color = 'currentColor' }: P) => (
  <svg {...base(size)} stroke={color}><path d="M13 7l9 9-9 9" /></svg>
);
/** Нос — главный символ проекта: два ноздревых завитка. */
export const IconNose = ({ size = 30, color = 'currentColor' }: P) => (
  <svg {...base(size)} stroke={color}>
    <path d="M16 6c-5 5-8 9-8 13a8 8 0 0 0 16 0c0-4-3-8-8-13Z" />
    <ellipse cx="12.5" cy="21" rx="2" ry="2.6" fill={color} stroke="none" />
    <ellipse cx="19.5" cy="21" rx="2" ry="2.6" fill={color} stroke="none" />
  </svg>
);
export const IconLens = ({ size = 30, color = 'currentColor' }: P) => (
  <svg {...base(size)} stroke={color}><circle cx="14" cy="14" r="8.5" /><path d="m21 21 6 6" /></svg>
);
