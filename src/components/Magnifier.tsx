import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { blip } from '../lib/audio';

/**
 * Лупа, которую ребёнок возит пальцем по фотографии.
 * Нужна, потому что разглядывать нос интереснее самому, чем получить готовый кроп:
 * палец ведёт — увеличенное пятно едет следом.
 */
export function Magnifier({ src, start, onPoke }:
  { src: string; start: { x: number; y: number }; onPoke?: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(start);
  const [dragging, setDragging] = useState(false);
  const ZOOM = 2.6, SIZE = 150;

  const move = (clientX: number, clientY: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setPos({
      x: Math.min(1, Math.max(0, (clientX - r.left) / r.width)),
      y: Math.min(1, Math.max(0, (clientY - r.top) / r.height)),
    });
  };

  return (
    <div
      ref={box}
      style={{ position: 'relative', touchAction: 'none', cursor: 'grab' }}
      onPointerDown={e => {
        (e.target as Element).setPointerCapture?.(e.pointerId);
        setDragging(true); move(e.clientX, e.clientY); blip(680); onPoke?.();
      }}
      onPointerMove={e => { if (dragging) move(e.clientX, e.clientY); }}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
    >
      <img src={src} alt="" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />

      <motion.div
        animate={{
          left: `${pos.x * 100}%`, top: `${pos.y * 100}%`,
          scale: dragging ? 1.08 : 1,
        }}
        transition={{ type: 'spring', stiffness: 520, damping: 34 }}
        style={{
          position: 'absolute', width: SIZE, height: SIZE,
          marginLeft: -SIZE / 2, marginTop: -SIZE / 2,
          borderRadius: '50%', pointerEvents: 'none',
          border: '7px solid #fff',
          boxShadow: '0 10px 32px rgba(0,0,0,.35), inset 0 0 0 2px rgba(0,0,0,.12)',
          backgroundImage: `url(${src})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${ZOOM * 100}% ${ZOOM * 100}%`,
          backgroundPosition: `${pos.x * 100}% ${pos.y * 100}%`,
        }}
      />
      <div style={{ position: 'absolute', right: 12, bottom: 12, background: 'rgba(255,255,255,.92)',
                    borderRadius: 999, padding: '8px 16px', fontWeight: 900, fontSize: 16,
                    pointerEvents: 'none' }}>
        🔍 Веди пальчиком
      </div>
    </div>
  );
}
