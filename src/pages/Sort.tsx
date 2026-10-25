import { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Nav } from '../components/Chrome';
import { Scene } from '../components/Scene';
import { Burst } from '../components/Burst';
import { animals, noseTypes, photoUrl, noseUrl, animalsOfType } from '../lib/content';
import { say, blip, animalSound } from '../lib/audio';

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - .5);

/**
 * «Отнеси носик в его домик» — перетаскивание.
 * Попадание считаем геометрически по координатам указателя: на тач-устройстве
 * действует неявный pointer capture, и события hover до домиков просто не доходят —
 * схема на onPointerEnter там не срабатывает вообще.
 */
export default function Sort() {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [hit, setHit] = useState(0);
  const [over, setOver] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const boxes = useRef<Record<string, HTMLDivElement | null>>({});

  const { beast, houses } = useMemo(() => {
    const beast = shuffle(animals)[0];
    const right = noseTypes.find(t => t.id === beast.type)!;
    const others = shuffle(noseTypes.filter(t => t.id !== right.id)).slice(0, 2);
    return { beast, houses: shuffle([right, ...others]) };
  }, [round]);

  const hitTest = (p: { x: number; y: number }) => {
    for (const [id, el] of Object.entries(boxes.current)) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      // поле попадания шире самой плашки: палец трёхлетки неточен
      if (p.x >= r.left - 24 && p.x <= r.right + 24 && p.y >= r.top - 24 && p.y <= r.bottom + 24) return id;
    }
    return null;
  };

  const drop = (typeId: string | null) => {
    setOver(null);
    if (!typeId) return;
    if (typeId === beast.type) {
      setScore(s => s + 1); setHit(h => h + 1); setDone(true);
      blip(900); say('ui-yes');
      setTimeout(() => animalSound(beast.id), 620);
      setTimeout(() => { setDone(false); setRound(r => r + 1); }, 1900);
    } else {
      blip(240); say('ui-no');
    }
  };

  return (
    <div className="screen">
      <Scene from="#E8F0C8" to="#A8DCC8" accent="#FFFFFF" seed={round + 4} />
      <div className="wrap" style={{ textAlign: 'center' }}>
        <Nav />
        <h1>Отнеси носик домой</h1>
        <p className="lead" style={{ margin: '10px auto 22px', color: 'var(--ink-soft)' }}>
          Тяни картинку в нужный домик · собрано {score}
        </p>

        <div style={{ position: 'relative', width: 196, height: 196, margin: '0 auto 30px', zIndex: 30 }}>
          <Burst on={hit} />
          <AnimatePresence mode="wait">
            <motion.div key={beast.id}
              drag dragSnapToOrigin dragElastic={.22}
              whileDrag={{ scale: 1.14, rotate: 4 }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: done ? 1.2 : 1, opacity: done ? 0 : 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 18 }}
              onDrag={(_, info) => setOver(hitTest(info.point))}
              onDragEnd={(_, info) => drop(hitTest(info.point))}
              style={{ width: 196, height: 196, borderRadius: '52% 48% 46% 54% / 48% 52% 48% 52%',
                       overflow: 'hidden', border: '7px solid #fff', cursor: 'grab',
                       boxShadow: '0 18px 44px rgba(0,0,0,.26)', touchAction: 'none' }}>
              <img src={noseUrl(beast.id)} alt={beast.ru} draggable={false}
                   style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div style={{ display: 'flex', gap: 'clamp(12px,2.2vw,28px)', justifyContent: 'center', flexWrap: 'wrap' }}>
          {houses.map(h => {
            // не берём того же зверя, что в руке: иначе ответ виден заранее
            const pool = animalsOfType(h.id).filter(x => x.id !== beast.id);
            const face = pool[0] || animalsOfType(h.id)[0];
            const active = over === h.id;
            return (
              <motion.div key={h.id} ref={el => { boxes.current[h.id] = el; }}
                animate={{ scale: active ? 1.07 : 1, y: active ? -6 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                style={{
                  width: 'clamp(152px,21vw,212px)', borderRadius: 30, overflow: 'hidden',
                  background: '#fff', textAlign: 'center',
                  border: `6px solid ${active ? h.palette.to : 'rgba(255,255,255,.9)'}`,
                  boxShadow: active ? '0 20px 46px rgba(0,0,0,.26)' : '0 8px 22px rgba(0,0,0,.14)',
                }}>
                {/* фото зверя этого типа — чтобы выбирать можно было не читая */}
                <div style={{ height: 94, background: `linear-gradient(150deg, ${h.palette.from}, ${h.palette.to})` }}>
                  {face && <img src={photoUrl(face.id)} alt="" loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .95 }} />}
                </div>
                <div style={{ padding: '12px 10px 14px', fontFamily: 'var(--display)', fontWeight: 600,
                              fontSize: 'clamp(16px,1.4vw,20px)', lineHeight: 1.15, color: 'var(--ink)' }}>
                  {h.name}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
