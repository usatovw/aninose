import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * Фон-сцена: несколько слоёв мягких пятен, которые едут с разной скоростью
 * за курсором/наклоном устройства. Глубина — то, что отличает «дорогую»
 * детскую графику от плоской заливки. Сверху — зерно, оно убирает
 * ощущение «чистого CSS-градиента».
 */
type Props = { from: string; to: string; accent?: string; seed?: number };

const SHAPES = [
  { x: 8,  y: 18, r: 340, d: 0.055, o: .55 },
  { x: 86, y: 12, r: 250, d: 0.090, o: .48 },
  { x: 74, y: 78, r: 400, d: 0.040, o: .44 },
  { x: 20, y: 86, r: 230, d: 0.110, o: .50 },
  { x: 50, y: 46, r: 440, d: 0.025, o: .22 },
];

export function Scene({ from, to, accent = '#fff', seed = 0 }: Props) {
  const mx = useMotionValue(0), my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 42, damping: 20, mass: .7 });
  const sy = useSpring(my, { stiffness: 42, damping: 20, mass: .7 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - .5);
      my.set(e.clientY / window.innerHeight - .5);
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      mx.set(Math.max(-.5, Math.min(.5, e.gamma / 60)));
      my.set(Math.max(-.5, Math.min(.5, (e.beta - 45) / 60)));
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('deviceorientation', onTilt);
    return () => { window.removeEventListener('pointermove', onMove);
                   window.removeEventListener('deviceorientation', onTilt); };
  }, [mx, my]);

  return (
    <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden',
                              background: `linear-gradient(155deg, ${from} 0%, ${to} 100%)` }}>
      {SHAPES.map((s, i) => (
        <Blob key={i} s={s} i={i + seed} sx={sx} sy={sy} accent={accent} />
      ))}
      <Grain />
    </div>
  );
}

function Blob({ s, i, sx, sy, accent }: any) {
  const tx = useTransform(sx, (v: number) => v * -s.r * s.d * 9);
  const ty = useTransform(sy, (v: number) => v * -s.r * s.d * 9);
  return (
    <motion.div
      style={{
        position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
        width: s.r, height: s.r, marginLeft: -s.r / 2, marginTop: -s.r / 2,
        borderRadius: '50%', x: tx, y: ty,
        background: `radial-gradient(circle at 34% 30%, ${accent}, transparent 68%)`,
        opacity: s.o, filter: 'blur(8px)',
      }}
      animate={{ scale: [1, 1.08, 1], rotate: [0, i % 2 ? 8 : -8, 0] }}
      transition={{ duration: 16 + i * 3, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

/** Зерно: тонкий шум поверх всей сцены, чтобы градиент не выглядел пластмассовым. */
function Grain() {
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
                  opacity: .16, mixBlendMode: 'overlay', pointerEvents: 'none' }}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
}
