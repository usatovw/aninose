import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Nav } from '../components/Chrome';
import { Scene } from '../components/Scene';
import { BlobPhoto } from '../components/BlobPhoto';
import { Burst } from '../components/Burst';
import { IconSound, IconNext, IconNose, IconLens } from '../components/Icon';
import { byId, typeById, animals, photos, photoUrl, noseUrl, displayFocus } from '../lib/content';
import { say, blip, animalSound, introduce } from '../lib/audio';
import { markSeen } from '../lib/progress';

export default function AnimalPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const a = byId(id);
  const reduce = useReducedMotion();
  const [zoom, setZoom] = useState(false);
  const [squash, setSquash] = useState(0);
  const [burst, setBurst] = useState(0);
  const [open, setOpen] = useState(false);
  const poked = useRef(false);

  useEffect(() => {
    if (!a) return;
    setZoom(false); setOpen(false); setBurst(0);
    poked.current = false;
    markSeen(a.id);
    const signal = { cancelled: false };
    introduce(a.id, signal);
    // если ребёнок не догадался нажать — подсказываем голосом
    const hint = setTimeout(() => { if (!poked.current) say('ui-tap-nose'); }, 9000);
    return () => { signal.cancelled = true; clearTimeout(hint); };
  }, [a?.id]);

  if (!a) return <div className="screen"><div className="wrap">Такого зверя у нас нет</div></div>;
  const t = typeById(a.type)!;
  const meta = photos[a.id] || {};
  const i = animals.findIndex(x => x.id === a.id);
  const marker = displayFocus(a.id, a.noseFocus);
  const next = animals[(i + 1) % animals.length];

  const poke = () => {
    poked.current = true;
    blip(760); setBurst(b => b + 1);
    setSquash(1); setTimeout(() => setSquash(0), 150);
    setZoom(z => !z);
    animalSound(a.id);
  };

  return (
    <div className="screen">
      <Scene from={a.palette.from} to={a.palette.to} accent="#FFFFFF" seed={i} />
      <div className="wrap">
        <Nav />

        <div className="animal-grid">
          <div style={{ position: 'relative', width: '100%', maxWidth: 'min(100%, 66vh)', justifySelf: 'center' }}>
            <Burst on={burst} />

            <AnimatePresence mode="wait">
              <motion.div key={zoom ? 'n' : 'f'}
                initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 190, damping: 20 }}>
                <BlobPhoto src={zoom ? noseUrl(a.id) : photoUrl(a.id)}
                           lens start={marker} squash={squash} />
              </motion.div>
            </AnimatePresence>

            {/* Кольцо, а не заливка: маркер не должен закрывать то, на что показывает.
                В режиме кропа та же кнопка возвращает обратно — иначе выйти нечем. */}
            <motion.button
              onClick={poke}
              aria-label={zoom ? 'Показать зверя целиком' : `Нажми на нос: ${a.ru}`}
              style={{
                position: 'absolute',
                left: zoom ? '50%' : `${marker.x * 100}%`,
                top: zoom ? '88%' : `${marker.y * 100}%`,
                width: 96, height: 96, marginLeft: -48, marginTop: -48, zIndex: 6,
                borderRadius: '50%', display: 'grid', placeItems: 'center',
                color: '#fff', background: 'rgba(40,24,10,.30)',
                border: '5px solid rgba(255,255,255,.96)',
                boxShadow: '0 10px 28px rgba(0,0,0,.3)', backdropFilter: 'blur(2px)',
              }}
              animate={reduce || zoom ? {} : { scale: [1, 1.05, 1] }}
              transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
              whileTap={{ scale: .86 }}>
              <IconNose size={40} />
            </motion.button>

            <div className="photo-hint">
              {zoom ? <><IconNose size={20} /> Это его настоящий носик</>
                    : <><IconLens size={20} /> Веди пальчиком — и рассмотри</>}
            </div>
          </div>

          <div>
            <motion.h1 initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              transition={{ delay: .1, type: 'spring', stiffness: 170, damping: 18 }}>
              {a.ru}
            </motion.h1>

            <motion.p className="lead"
              initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: .22, type: 'spring', stiffness: 170, damping: 19 }}
              style={{ margin: '14px 0 24px' }}>
              {a.kid}
            </motion.p>

            <motion.div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
              initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .32 }}>
              <button className="btn btn--quiet" onClick={() => { blip(620); say(`a-${a.id}-kid`); }}>
                <IconSound size={26} /> Послушать
              </button>
              <button className="btn" onClick={() => { blip(640); nav(`/animal/${next.id}`); }}>
                Дальше <IconNext size={26} />
              </button>
            </motion.div>

            <button className="link-soft" onClick={() => { blip(500); nav(`/type/${t.id}`); }}>
              {t.name} — кто ещё →
            </button>

            <div style={{ marginTop: 18 }}>
              <button className="adult-toggle" onClick={() => setOpen(o => !o)}>
                {open ? '— Свернуть' : 'i  Для взрослых'}
              </button>
              <AnimatePresence>
                {open && (
                  <motion.div className="note" style={{ marginTop: 12 }}
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: .26 }}>
                    <h4>Для взрослых</h4>
                    <p style={{ margin: 0 }}>{a.parent}</p>
                    {a.note && <p style={{ marginTop: 10, color: '#B0552F' }}>{a.note}</p>}
                    <div className="note__src">
                      <a href={`https://en.wikipedia.org/wiki/${encodeURIComponent(a.wiki)}`}
                         target="_blank" rel="noreferrer">Wikipedia: {a.wiki}</a>
                      <br />Фото: {meta.author || '—'} · {meta.license}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
