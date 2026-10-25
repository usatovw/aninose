import { useReducedMotion, motion } from 'framer-motion';

/**
 * Фон-сцена: ровное тёплое поле и одно мягкое пятно света за героем.
 * Раньше тут был градиент с пятью размытыми кругами — именно он читался
 * как «дешёвый CSS». В детских книжках фон плоский, а глубину даёт
 * тень под персонажем, а не слои тумана.
 */
type Props = { from: string; to: string; accent?: string; seed?: number };

export function Scene({ from, to }: Props) {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden',
                              background: from }}>
      <motion.div
        initial={{ scale: .9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: reduce ? 0 : 1.1, ease: [.2, .8, .3, 1] }}
        style={{
          position: 'absolute', left: '34%', top: '48%',
          width: '92vmax', height: '92vmax', marginLeft: '-46vmax', marginTop: '-46vmax',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${to} 0%, ${to} 34%, transparent 66%)`,
          opacity: .5,
        }}
      />
      <Grain />
    </div>
  );
}

/** Зерно: едва заметный шум, чтобы заливка не выглядела пластмассовой. */
function Grain() {
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
                  opacity: .12, mixBlendMode: 'multiply', pointerEvents: 'none' }}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
}
