import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';

/**
 * Для тех зверей, у кого вырез из фона не получился (макро-кадр, камуфляж,
 * зверь занимает весь кадр) — фото лежит на поле наклеенным стикером:
 * толстая светлая кайма, мягкие углы, та же тень на земле, что и у силуэтов.
 * Так оба приёма живут в одном языке, а не выглядят как две разные вёрстки.
 */
type Props = { src: string; squash?: number; maxH?: string;
               onPoke?: () => void; children?: React.ReactNode };

export function Sticker({ src, squash = 0, maxH, onPoke, children }: Props) {
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const [grabbed, setGrabbed] = useState(false);

  const rx = useMotionValue(0), ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 80, damping: 16 });
  const sry = useSpring(ry, { stiffness: 80, damping: 16 });
  const tiltX = useTransform(srx, v => `${v}deg`);
  const tiltY = useTransform(sry, v => `${v}deg`);

  const track = (cx: number, cy: number) => {
    const r = box.current?.getBoundingClientRect(); if (!r) return;
    rx.set(((cy - r.top) / r.height - .5) * -5);
    ry.set(((cx - r.left) / r.width - .5) * 5);
  };

  return (
    <motion.div
      ref={box}
      style={{ position: 'relative', width: '100%', touchAction: 'pan-y',
               rotateX: reduce ? 0 : tiltX, rotateY: reduce ? 0 : tiltY,
               transformPerspective: 1200 }}
      animate={{ scaleX: 1 + squash * .05, scaleY: 1 - squash * .06, y: squash * 10 }}
      transition={{ type: 'spring', stiffness: 700, damping: 14 }}
      onPointerMove={e => track(e.clientX, e.clientY)}
      onPointerLeave={() => { rx.set(0); ry.set(0); }}
      onPointerDown={() => { setGrabbed(true); onPoke?.(); }}
      onPointerUp={() => setGrabbed(false)}
    >
      <div aria-hidden style={{
        position: 'absolute', left: '12%', right: '12%', bottom: '-3%', height: '7%',
        borderRadius: '50%', background: 'rgba(70,40,15,.3)', filter: 'blur(16px)', zIndex: 0 }} />
      <motion.div
        animate={reduce ? {} : { y: [0, -9, 0], rotate: [-1.4, -0.6, -1.4] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'relative', zIndex: 1,
          borderRadius: '14% 14% 14% 14% / 11% 11% 11% 11%',
          overflow: 'hidden', background: '#fff',
          boxShadow: '0 0 0 12px #fff, 0 22px 44px rgba(70,40,15,.22)',
          transform: grabbed ? 'scale(.985)' : undefined,
          transition: 'transform .16s ease',
        }}>
        <img src={src} alt="" draggable={false}
             style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block',
                      maxHeight: maxH }} />
      </motion.div>
      {children}
    </motion.div>
  );
}
