import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { cutMask } from '../lib/content';

/**
 * Зверь, вырезанный из фона, стоит прямо на цветном поле — как в детских книжках
 * и в референсах заказчика. Фотография в рамке читается как документ,
 * вырезанный силуэт — как персонаж, с которым можно играть.
 * Под ним мягкая тень на «земле»: без неё силуэт висит в пустоте.
 */
type Props = {
  src: string;
  shadow?: boolean;
  squash?: number;
  maxH?: string;            // чтобы высокий зверь не выталкивал кнопку за экран
  onPoke?: () => void;
  children?: React.ReactNode;   // хотспот носа и прочее поверх
};

export function Cutout({ src, shadow = true, squash = 0, maxH, onPoke, children }: Props) {
  const reduce = useReducedMotion();
  const mask = cutMask(src.split('/').pop()!.replace('.png', ''));
  const box = useRef<HTMLDivElement>(null);
  const [grabbed, setGrabbed] = useState(false);

  // лёгкий поворот за курсором: силуэт оживает, но без 3D-аттракциона
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 80, damping: 16 });
  const sry = useSpring(ry, { stiffness: 80, damping: 16 });
  const tiltX = useTransform(srx, v => `${v}deg`);
  const tiltY = useTransform(sry, v => `${v}deg`);

  const track = (cx: number, cy: number) => {
    const r = box.current?.getBoundingClientRect(); if (!r) return;
    rx.set(((cy - r.top) / r.height - .5) * -6);
    ry.set(((cx - r.left) / r.width - .5) * 6);
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
      {shadow && (
        /* тень на земле: отдельным пятном, чтобы зверь не висел в воздухе */
        <motion.div
          aria-hidden
          animate={reduce ? {} : { scaleX: [1, .9, 1], opacity: [.3, .22, .3] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', left: '14%', right: '14%', bottom: '-3%', height: '7%',
            borderRadius: '50%', background: 'rgba(70,40,15,1)', opacity: .3,
            filter: 'blur(16px)', zIndex: 0,
          }}
        />
      )}
      <motion.img
        src={src} alt=""
        draggable={false}
        animate={reduce ? {} : { y: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'relative', zIndex: 1,
          width: '100%', display: 'block', userSelect: 'none', ...mask,
          maxHeight: maxH, objectFit: 'contain',
          // собственную тень лепим из силуэта, иначе она была бы прямоугольной
          filter: shadow ? 'drop-shadow(0 14px 18px rgba(70,40,15,.18))' : 'none',
          transform: grabbed ? 'scale(.985)' : undefined,
          transition: 'transform .16s ease',
        }}
      />
      {children}
    </motion.div>
  );
}
