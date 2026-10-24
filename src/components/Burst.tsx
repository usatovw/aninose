import { motion, AnimatePresence } from 'framer-motion';

/**
 * Вспышка частиц в момент, когда ребёнок попал по носу.
 * Короткая и физичная: разлёт по дуге с разными задержками,
 * без «салюта на весь экран» — награда, а не аттракцион.
 */
const N = 14;
const COLORS = ['#FFD166', '#F2603C', '#FF8FA3', '#8ED5C0', '#FFFFFF'];

export function Burst({ on }: { on: number }) {
  return (
    <AnimatePresence>
      {on > 0 && (
        <div key={on} aria-hidden
             style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}>
          {Array.from({ length: N }).map((_, i) => {
            const a = (i / N) * Math.PI * 2 + (on % 7) * .3;
            const d = 110 + (i % 4) * 34;
            return (
              <motion.span
                key={i}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d - 20, scale: [0, 1.2, .5], opacity: [1, 1, 0] }}
                transition={{ duration: .85, delay: (i % 5) * .025, ease: [.2, .8, .3, 1] }}
                style={{
                  position: 'absolute', left: '50%', top: '50%',
                  width: i % 3 ? 15 : 22, height: i % 3 ? 15 : 22,
                  borderRadius: i % 2 ? '50%' : '34%',
                  background: COLORS[i % COLORS.length],
                  boxShadow: '0 4px 12px rgba(0,0,0,.18)',
                }}
              />
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}
