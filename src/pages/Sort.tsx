import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Nav } from '../components/Chrome';
import { Scene } from '../components/Scene';
import { Burst } from '../components/Burst';
import { animals, noseTypes, photoUrl, noseUrl } from '../lib/content';
import { say, blip, animalSound } from '../lib/audio';

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - .5);

/**
 * «Отнеси носик в его домик»: перетаскивание — та самая «тянучка».
 * Домиков всегда три, иначе трёхлетке не выбрать.
 */
export default function Sort() {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [hit, setHit] = useState(0);
  const [over, setOver] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const { beast, houses } = useMemo(() => {
    const beast = shuffle(animals)[0];
    const right = noseTypes.find(t => t.id === beast.type)!;
    const others = shuffle(noseTypes.filter(t => t.id !== right.id)).slice(0, 2);
    return { beast, houses: shuffle([right, ...others]) };
  }, [round]);

  const drop = (typeId: string) => {
    setOver(null);
    if (typeId === beast.type) {
      setScore(s => s + 1); setHit(h => h + 1); setDone(true);
      blip(900); say('ui-yes'); setTimeout(() => animalSound(beast.id), 600);
      setTimeout(() => { setDone(false); setRound(r => r + 1); }, 1900);
    } else { blip(240); say('ui-no'); }
  };

  return (
    <div className="screen">
      <Scene from="#E8F0C8" to="#A8DCC8" accent="#FFFFFF" seed={round + 4} />
      <div className="wrap" style={{ textAlign: 'center' }}>
        <Nav />
        <h1>Отнеси носик домой</h1>
        <p className="lead" style={{ margin: '12px auto 26px', color: 'var(--ink-soft)' }}>
          Тяни картинку в нужный домик · собрано {score}
        </p>

        <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto 34px' }}>
          <Burst on={hit} />
          <AnimatePresence mode="wait">
            <motion.div key={beast.id}
              drag dragSnapToOrigin dragElastic={.22}
              whileDrag={{ scale: 1.14, rotate: 4, zIndex: 20, cursor: 'grabbing' }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: done ? 1.2 : 1, opacity: done ? 0 : 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 18 }}
              onDragEnd={() => { if (over) drop(over); }}
              style={{ width: 200, height: 200, borderRadius: '52% 48% 46% 54% / 48% 52% 48% 52%',
                       overflow: 'hidden', border: '7px solid #fff', cursor: 'grab',
                       boxShadow: '0 18px 44px rgba(0,0,0,.26)', touchAction: 'none' }}>
              <img src={noseUrl(beast.id)} alt={beast.ru} draggable={false}
                   style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div style={{ display: 'flex', gap: 'clamp(12px,2.2vw,28px)', justifyContent: 'center', flexWrap: 'wrap' }}>
          {houses.map(h => (
            <motion.div key={h.id}
              onPointerEnter={() => setOver(h.id)} onPointerLeave={() => setOver(o => o === h.id ? null : o)}
              animate={{ scale: over === h.id ? 1.07 : 1,
                         boxShadow: over === h.id ? '0 18px 44px rgba(0,0,0,.3)' : '0 8px 22px rgba(0,0,0,.14)' }}
              style={{ width: 'clamp(150px,20vw,210px)', padding: '22px 16px', borderRadius: 30,
                       background: `linear-gradient(150deg, ${h.palette.from}, ${h.palette.to})`,
                       color: '#fff', fontFamily: 'var(--display)', fontWeight: 600,
                       fontSize: 'clamp(17px,1.5vw,21px)', lineHeight: 1.15,
                       border: over === h.id ? '4px dashed rgba(255,255,255,.9)' : '4px solid transparent' }}>
              {h.name}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
