import { useId, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';

/**
 * Фотография внутри живой органической маски.
 * Маска медленно перетекает между четырьмя формами — у кадра появляется
 * «дыхание», и он перестаёт быть прямоугольной плиткой. Внутри работает лупа:
 * ребёнок водит пальцем и сам находит нос.
 *
 * Пути специально описаны одинаковой последовательностью команд (M + 4×C + Z),
 * иначе интерполяция между ними рвётся.
 */
const SHAPES = [
  'M300,18 C420,56 492,176 452,300 C412,424 300,496 186,468 C68,438 8,318 28,196 C48,74 176,-20 300,18 Z',
  'M268,8 C408,26 500,160 462,296 C424,430 284,508 170,460 C54,410 6,268 40,158 C74,48 134,-10 268,8 Z',
  'M312,34 C428,88 486,220 436,330 C384,444 272,500 164,456 C52,410 14,282 44,172 C76,56 196,-20 312,34 Z',
  'M282,14 C416,40 494,150 468,282 C442,418 318,502 198,464 C74,424 20,296 36,180 C54,58 148,-12 282,14 Z',
];

type Props = {
  src: string;
  lens?: boolean;
  start?: { x: number; y: number };
  squash?: number;          // 0..1 — импульс сжатия при нажатии
  onPointer?: () => void;
};

export function BlobPhoto({ src, lens = true, start = { x: .5, y: .5 }, squash = 0, onPointer }: Props) {
  const id = useId().replace(/:/g, '');
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(start);
  const [dragging, setDragging] = useState(false);

  // лёгкий наклон за курсором — объём без 3D
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 90, damping: 18 });
  const sry = useSpring(ry, { stiffness: 90, damping: 18 });
  const tiltX = useTransform(srx, v => `${v}deg`);
  const tiltY = useTransform(sry, v => `${v}deg`);

  const track = (cx: number, cy: number) => {
    const r = box.current?.getBoundingClientRect(); if (!r) return;
    const nx = Math.min(1, Math.max(0, (cx - r.left) / r.width));
    const ny = Math.min(1, Math.max(0, (cy - r.top) / r.height));
    setPos({ x: nx, y: ny });
    rx.set((ny - .5) * -7); ry.set((nx - .5) * 7);
  };

  return (
    <motion.div
      ref={box}
      style={{ position: 'relative', width: '100%', aspectRatio: '1/1',
               rotateX: tiltX, rotateY: tiltY, transformPerspective: 1000,
               // pan-y: лупу ведём по горизонтали, вертикаль отдаём скроллу страницы
               touchAction: 'pan-y' }}
      animate={{ scaleX: 1 + squash * .06, scaleY: 1 - squash * .07, y: squash * 8 }}
      transition={{ type: 'spring', stiffness: 700, damping: 14 }}
      onPointerDown={e => { (e.target as Element).setPointerCapture?.(e.pointerId);
                            setDragging(true); track(e.clientX, e.clientY); onPointer?.(); }}
      onPointerMove={e => { if (dragging) track(e.clientX, e.clientY); }}
      onPointerUp={() => { setDragging(false); rx.set(0); ry.set(0); }}
      onPointerCancel={() => { setDragging(false); rx.set(0); ry.set(0); }}
    >
      {/* мягкая тень формы — лежит под фото и живёт отдельно */}
      <motion.div
        style={{ position: 'absolute', inset: '6% 6% -2% 6%', borderRadius: '50%',
                 background: 'rgba(70,40,15,.3)', filter: 'blur(34px)', zIndex: -1 }}
        animate={{}}
      />
      <svg viewBox="0 0 500 500" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          <clipPath id={`clip-${id}`}>
            <motion.path
              initial={{ d: SHAPES[0] }}
              animate={reduce ? { d: SHAPES[0] } : { d: [...SHAPES, SHAPES[0]] }}
              transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
              d={SHAPES[0]}
            />
          </clipPath>
        </defs>
        <g clipPath={`url(#clip-${id})`}>
          <image href={src} x="0" y="0" width="500" height="500" preserveAspectRatio="xMidYMid slice" />
          {/* внутреннее свечение сверху — добавляет объём */}
          <rect width="500" height="500" fill="url(#sheen)" opacity=".5" />
        </g>
        <defs>
          <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity=".22" />
            <stop offset=".45" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {lens && (
        <motion.div
          animate={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%`,
                     scale: dragging ? 1 : .4, opacity: dragging ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 480, damping: 32 }}
          style={{
            position: 'absolute', width: 148, height: 148, marginLeft: -74, marginTop: -74,
            borderRadius: '50%', pointerEvents: 'none', border: '6px solid rgba(255,255,255,.96)',
            boxShadow: '0 14px 36px rgba(0,0,0,.34), inset 0 0 22px rgba(0,0,0,.18)',
            backgroundImage: `url(${src})`, backgroundRepeat: 'no-repeat',
            backgroundSize: '280% 280%',
            backgroundPosition: `${pos.x * 100}% ${pos.y * 100}%`,
          }}
        />
      )}
    </motion.div>
  );
}
