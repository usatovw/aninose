import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useParams, useNavigate, useNavigationType } from 'react-router-dom';
import { Nav } from '../components/Chrome';
import { Scene } from '../components/Scene';
import { BlobPhoto } from '../components/BlobPhoto';
import { Cutout } from '../components/Cutout';
import { Sticker } from '../components/Sticker';
import { Burst } from '../components/Burst';
import { IconSound, IconNext, IconNose, IconLens, IconZoomIn, IconZoomOut } from '../components/Icon';
import { byId, typeById, animals, animalsOfType, photos, photoUrl, noseUrl, hasCut, cutUrl } from '../lib/content';
import { say, blip, animalSound, introduce, autoPlaysLeft, noteAutoPlay } from '../lib/audio';
import { markSeen } from '../lib/progress';

export default function AnimalPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const a = byId(id);
  const reduce = useReducedMotion();
  const navType = useNavigationType();
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
    // POP — это кнопка «Назад»: ребёнок уже слышал этого зверя, повтор сбивает.
    const auto = navType !== 'POP' && autoPlaysLeft() > 0;
    if (auto) { noteAutoPlay(); introduce(a.id, signal, { queued: true }); }
    const hint = auto
      ? setTimeout(() => { if (!poked.current) say('ui-tap-nose'); }, 9000)
      : undefined;
    return () => { signal.cancelled = true; if (hint) clearTimeout(hint); };
  }, [a?.id]);

  if (!a) return <div className="screen"><div className="wrap">Такого зверя у нас нет</div></div>;
  const t = typeById(a.type)!;
  const meta = photos[a.id] || {};
  // Кроп носа теперь строится из отдельного близкого кадра и уже отцентрован,
  // поэтому лупа стартует из середины, а не из координаты на общем фото.
  const marker = { x: .5, y: .5 };
  const i = animals.findIndex(x => x.id === a.id);
  // «Дальше» ведёт по своему домику, а не по общему списку: иначе
  // после коровы прилетает акула, и тема рассыпается
  const group = animalsOfType(a.type);
  const gi = group.findIndex(x => x.id === a.id);
  const next = group[(gi + 1) % group.length];
  const lastInGroup = group.length > 1 && gi === group.length - 1;

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
                {zoom
                  ? <BlobPhoto src={noseUrl(a.id)} lens start={marker} squash={squash} />
                  : hasCut(a.id)
                    ? <Cutout src={cutUrl(a.id)} squash={squash} maxH="min(56vh, 560px)" />
                    : <Sticker src={photoUrl(a.id)} squash={squash} maxH="min(56vh, 560px)" />}
              </motion.div>
            </AnimatePresence>

            {/* Кнопка-носик: крупная, с живым превью носа внутри —
                так понятно, что будет, если нажать. */}
            <motion.button
              onClick={poke}
              aria-label={zoom ? `Показать целиком: ${a.ru}` : `Посмотреть нос: ${a.ru}`}
              className="nose-btn"
              animate={reduce ? {} : { scale: [1, 1.04, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              whileTap={{ scale: .9 }}>
              <span className="nose-btn__pic">
                <img src={zoom ? photoUrl(a.id) : noseUrl(a.id)} alt="" />
              </span>
              <span className="nose-btn__label">
                {/* не склоняем имя: «Показать курочка» резало глаз,
                    а винительный падеж для 57 видов — лишнее поле в данных */}
                {zoom ? <>Показать целиком</> : <>Вот его носик</>}
                {zoom ? <IconZoomOut size={24} /> : <IconZoomIn size={24} />}
              </span>
            </motion.button>
          </div>

          <div className="animal-col">
            <motion.h1 className="animal-name"
              style={{ ['--len' as any]: a.ru.length }}
              initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
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
              <button className="btn btn--quiet"
                onClick={() => { blip(620); poked.current = true; introduce(a.id); }}>
                <IconSound size={26} /> Послушать
              </button>
              <button className="btn" onClick={() => { blip(640); nav(`/animal/${next.id}`); }}>
                {lastInGroup ? 'Сначала' : 'Дальше'} <IconNext size={26} />
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
