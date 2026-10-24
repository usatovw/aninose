import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { TopBar } from '../components/Chrome';
import { byId, typeById, animals, photos, photoUrl, noseUrl, gradient } from '../lib/content';
import { say, blip, animalSound, introduce } from '../lib/audio';
import { markSeen } from '../lib/progress';

export default function AnimalPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const a = byId(id);
  const [zoom, setZoom] = useState(false);      // нажали на нос -> приближаем настоящий нос
  const [showParent, setShowParent] = useState(false);

  useEffect(() => {
    if (!a) return;
    setZoom(false); setShowParent(false);
    markSeen(a.id);
    introduce(a.id);                            // «Собака!» + голос животного
  }, [a?.id]);

  if (!a) return <div className="page">Такого зверя у нас нет</div>;
  const t = typeById(a.type)!;
  const meta = photos[a.id] || {};
  const idx = animals.findIndex(x => x.id === a.id);
  const next = animals[(idx + 1) % animals.length];
  const prev = animals[(idx - 1 + animals.length) % animals.length];

  const pokeNose = () => {
    blip(700);
    setZoom(z => !z);
    animalSound(a.id);
  };

  return (
    <div className="page">
      <div className="hero-bg" style={{ background: gradient(a.palette) }} />
      <div className="wrap">
        <TopBar />

        <div style={{ display: 'grid', gap: 'clamp(18px,2.5vw,40px)',
                      gridTemplateColumns: 'minmax(300px,1fr) minmax(280px,420px)', alignItems: 'start' }}>

          {/* ——— фото + хотспот носа ——— */}
          <motion.div layout className="sticker" style={{ position: 'relative' }}>
            <AnimatePresence mode="wait">
              <motion.img
                key={zoom ? 'nose' : 'full'}
                src={zoom ? noseUrl(a.id) : photoUrl(a.id)}
                alt={zoom ? `Нос: ${a.ru}` : a.ru}
                initial={{ opacity: 0, scale: zoom ? .75 : 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: .35, ease: [.3, 1, .4, 1] }}
                style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', cursor: 'pointer' }}
                onClick={pokeNose}
              />
            </AnimatePresence>

            {!zoom && (
              <motion.button
                className="nose-dot"
                onClick={pokeNose}
                aria-label={`Нажми на нос: ${a.ru}`}
                style={{ left: `${a.noseFocus.x * 100}%`, top: `${a.noseFocus.y * 100}%` }}
                animate={{ scale: [1, 1.14, 1], opacity: [.85, 1, .85] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                whileTap={{ scale: .85 }}
              >👆</motion.button>
            )}

            <div style={{ position: 'absolute', left: 14, top: 14, background: 'rgba(255,255,255,.92)',
                          borderRadius: 999, padding: '8px 18px', fontWeight: 900, fontSize: 18 }}>
              {zoom ? 'Это носик! 👃' : 'Нажми на носик'}
            </div>
          </motion.div>

          {/* ——— текст ——— */}
          <div>
            <motion.h1 initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              style={{ color: '#fff', textShadow: '0 3px 16px rgba(0,0,0,.3)' }}>
              {a.emoji} {a.ru}
            </motion.h1>

            <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .1 }}
              style={{ background: '#fff', borderRadius: 'var(--r-md)', padding: '22px 26px',
                       boxShadow: 'var(--shadow-soft)', marginBottom: 14 }}>
              <p style={{ fontSize: 'clamp(20px,1.8vw,26px)', fontWeight: 700, margin: 0 }}>{a.kid}</p>
              <button className="pill" style={{ marginTop: 16, minHeight: 72 }}
                onClick={() => { blip(620); say(`a-${a.id}-kid`); }}>🔊 Расскажи ещё раз</button>
            </motion.div>

            <button className="pill" style={{ marginBottom: 14, background: gradient(t.palette), color: '#fff' }}
              onClick={() => { blip(540); nav(`/type/${t.id}`); }}>
              {t.emoji} {t.name}
            </button>

            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <button className="big-btn" aria-label="Предыдущий зверь"
                onClick={() => { blip(430); nav(`/animal/${prev.id}`); }}>⬅️</button>
              <button className="pill" style={{ flex: 1 }}
                onClick={() => { blip(640); nav(`/animal/${next.id}`); }}>
                Следующий {next.emoji}
              </button>
            </div>

            <button className="pill" style={{ width: '100%', justifyContent: 'center', fontSize: 19, minHeight: 62 }}
              onClick={() => setShowParent(s => !s)}>
              {showParent ? '▲ Свернуть' : '▼ Для взрослых'}
            </button>

            <AnimatePresence>
              {showParent && (
                <motion.div className="parent-box" style={{ marginTop: 12 }}
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: .25 }}>
                  <h4>Точная формулировка</h4>
                  <p style={{ fontSize: 17 }}>{a.parent}</p>
                  {a.note && (
                    <p style={{ fontSize: 15, color: '#B07', background: '#FFF0F6',
                                padding: '10px 14px', borderRadius: 12 }}>
                      ⚠ {a.note}
                    </p>
                  )}
                  <div className="src">
                    <a href={`https://en.wikipedia.org/wiki/${encodeURIComponent(a.wiki)}`} target="_blank" rel="noreferrer">
                      Wikipedia: {a.wiki}
                    </a>
                    <br />
                    Фото: {meta.author || '—'} · {meta.license}{' '}
                    {meta.descUrl && <a href={meta.descUrl} target="_blank" rel="noreferrer">источник</a>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
