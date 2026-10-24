import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Nav } from '../components/Chrome';
import { Scene } from '../components/Scene';
import { BlobPhoto } from '../components/BlobPhoto';
import { Burst } from '../components/Burst';
import { IconSound, IconNext, IconNose, IconLens } from '../components/Icon';
import { byId, typeById, animals, photos, photoUrl, noseUrl } from '../lib/content';
import { say, blip, animalSound, introduce } from '../lib/audio';
import { markSeen } from '../lib/progress';

export default function AnimalPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const a = byId(id);
  const [zoom, setZoom] = useState(false);
  const [squash, setSquash] = useState(0);
  const [burst, setBurst] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!a) return;
    setZoom(false); setOpen(false); setBurst(0);
    markSeen(a.id);
    introduce(a.id);
  }, [a?.id]);

  if (!a) return <div className="screen"><div className="wrap">Такого зверя у нас нет</div></div>;
  const t = typeById(a.type)!;
  const meta = photos[a.id] || {};
  const i = animals.findIndex(x => x.id === a.id);
  const next = animals[(i + 1) % animals.length];

  // Нажатие на нос: сжатие формы, вспышка, звук — как у живой игрушки.
  const poke = () => {
    blip(760); setZoom(z => !z); setBurst(b => b + 1);
    setSquash(1); setTimeout(() => setSquash(0), 150);
    animalSound(a.id);
  };

  return (
    <div className="screen">
      <Scene from={a.palette.from} to={a.palette.to} accent="#FFFFFF" seed={i} />
      <div className="wrap">
        <Nav light />

        <div style={{ display: 'grid', gap: 'clamp(20px,3.5vw,64px)',
                      gridTemplateColumns: 'minmax(290px, 1.05fr) minmax(280px, 460px)',
                      alignItems: 'center' }}>

          <div style={{ position: 'relative', width: '100%', maxWidth: 'min(100%, 54vh)', justifySelf: 'center' }}>
            {/* контур-подложка со смещением — даёт глубину и «ручную» композицию */}
            <motion.div aria-hidden
              initial={{ rotate: -9, scale: .9, opacity: 0 }}
              animate={{ rotate: [-9, -5, -9], scale: 1, opacity: 1 }}
              transition={{ rotate: { duration: 12, repeat: Infinity, ease: 'easeInOut' },
                            scale: { type: 'spring', stiffness: 140, damping: 18 }, opacity: { duration: .5 } }}
              style={{ position: 'absolute', inset: '-4% -6% -2% 2%',
                       border: '5px dashed rgba(255,255,255,.5)', borderRadius: '46% 54% 50% 50% / 50% 46% 54% 50%' }} />
            <Burst on={burst} />
            <AnimatePresence mode="wait">
              <motion.div key={zoom ? 'n' : 'f'}
                initial={{ opacity: 0, scale: .88 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ type: 'spring', stiffness: 190, damping: 20 }}>
                <motion.div animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
                  <BlobPhoto src={zoom ? noseUrl(a.id) : photoUrl(a.id)}
                             lens={!zoom} start={a.noseFocus} squash={squash} />
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {!zoom && (
              <motion.button
                onClick={poke} aria-label={`Нажми на нос: ${a.ru}`}
                style={{
                  position: 'absolute', left: `${a.noseFocus.x * 100}%`, top: `${a.noseFocus.y * 100}%`,
                  width: 92, height: 92, marginLeft: -46, marginTop: -46, zIndex: 6,
                  borderRadius: '50%', display: 'grid', placeItems: 'center',
                  background: 'rgba(255,255,255,.2)', color: '#fff',
                  border: '4px solid rgba(255,255,255,.95)',
                  boxShadow: '0 10px 28px rgba(0,0,0,.28)', backdropFilter: 'blur(3px)',
                }}
                animate={{ scale: [1, 1.13, 1], boxShadow:
                  ['0 10px 28px rgba(0,0,0,.28)', '0 14px 38px rgba(0,0,0,.34)', '0 10px 28px rgba(0,0,0,.28)'] }}
                transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
                whileTap={{ scale: .84 }}>
                <IconNose size={38} />
              </motion.button>
            )}

            {!zoom && (
              <motion.button onClick={poke} aria-label="Показать нос крупно"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, y: [0, -9, 0] }}
                transition={{ scale: { delay: .42, type: 'spring', stiffness: 230, damping: 13 },
                              y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: .9 } }}
                whileHover={{ scale: 1.07 }} whileTap={{ scale: .9 }}
                style={{ position: 'absolute', right: '-2%', bottom: '6%', width: 132, height: 132,
                         borderRadius: '54% 46% 50% 50% / 48% 52% 48% 52%', overflow: 'hidden',
                         border: '6px solid #fff', boxShadow: '0 16px 40px rgba(0,0,0,.3)', zIndex: 7 }}>
                <img src={noseUrl(a.id)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </motion.button>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .5 }}
              style={{ display: 'flex', alignItems: 'center', gap: 9, justifyContent: 'center',
                       marginTop: 14, color: 'rgba(255,255,255,.95)', fontWeight: 700, fontSize: 17,
                       textShadow: '0 2px 10px rgba(0,0,0,.3)' }}>
              {zoom ? <><IconNose size={21} /> Это его настоящий носик</>
                    : <><IconLens size={21} /> Веди пальчиком — и рассмотри</>}
            </motion.div>
          </div>

          <div>
            <motion.div initial={{ x: 26, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              transition={{ delay: .14, type: 'spring', stiffness: 170, damping: 18 }}>
              <h1 style={{ color: '#fff', textShadow: '0 6px 30px rgba(0,0,0,.3)',
                           marginLeft: 'clamp(-70px, -4vw, 0px)' }}>{a.ru}</h1>
            </motion.div>

            <motion.p className="lead"
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: .26, type: 'spring', stiffness: 170, damping: 19 }}
              style={{ color: '#fff', textShadow: '0 2px 16px rgba(0,0,0,.3)', margin: '16px 0 26px',
                       maxWidth: '26ch' }}>
              {a.kid}
            </motion.p>

            <motion.div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
              initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .38 }}>
              <button className="btn btn--quiet" onClick={() => { blip(620); say(`a-${a.id}-kid`); }}>
                <IconSound size={26} /> Ещё раз
              </button>
              <button className="btn" onClick={() => { blip(640); nav(`/animal/${next.id}`); }}>
                Дальше <IconNext size={26} />
              </button>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .5 }}
              onClick={() => { blip(500); nav(`/type/${t.id}`); }}
              style={{ marginTop: 18, minHeight: 56, padding: '0 4px', color: '#fff', fontWeight: 800, fontSize: 18,
                       textDecoration: 'underline', textUnderlineOffset: 6, opacity: .95 }}>
              Такой же носик есть ещё у кого-то →
            </motion.button>

            <div style={{ marginTop: 26 }}>
              <button onClick={() => setOpen(o => !o)}
                style={{ fontSize: 16, fontWeight: 700, minHeight: 52, padding: '0 4px', color: 'rgba(255,255,255,.85)' }}>
                {open ? '— Свернуть' : '+ Для взрослых'}
              </button>
              <AnimatePresence>
                {open && (
                  <motion.div className="note" style={{ marginTop: 12 }}
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: .26 }}>
                    <h4>Точная формулировка</h4>
                    <p style={{ margin: 0 }}>{a.parent}</p>
                    {a.note && <p style={{ marginTop: 10, color: '#C0603C' }}>{a.note}</p>}
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
