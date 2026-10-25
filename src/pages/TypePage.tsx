import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Nav } from '../components/Chrome';
import { Scene } from '../components/Scene';
import { Cutout } from '../components/Cutout';
import { Sticker } from '../components/Sticker';
import { IconSound } from '../components/Icon';
import { typeById, animalsOfType, tileUrl, noseUrl, hasCut, cutUrl, photoUrl, plural } from '../lib/content';
import { say, blip, animalSound } from '../lib/audio';

export default function TypePage() {
  const { id } = useParams();
  const nav = useNavigate();
  const t = typeById(id);
  // «Вертелка»: карусель зверей этого типа — ребёнок крутит и слушает
  const [k, setK] = useState(0);
  useEffect(() => { if (t) { setK(0); say(`t-${t.id}-kid`); } }, [t?.id]);
  if (!t) return <div className="screen"><div className="wrap">Не нашли такой носик</div></div>;
  const pets = animalsOfType(t.id);
  const cur = pets[k % pets.length];

  const go = (dir: number) => {
    const nextIdx = (k + dir + pets.length) % pets.length;
    setK(nextIdx); blip(620);
    const nx = pets[nextIdx];
    say(`a-${nx.id}-name`).then(() => animalSound(nx.id));
  };

  return (
    <div className="screen">
      <Scene from={t.palette.from} to={t.palette.to} />
      <div className="wrap">
        <Nav />

        <div className="type-hero">
          <motion.div
            drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={.45}
            onDragEnd={(_, info) => {
              if (Math.abs(info.offset.x) < 50) return;
              // индекс считаем заранее: cur взят из замыкания и после setK ещё старый,
              // из-за чего карусель озвучивала предыдущего зверя
              go(info.offset.x < 0 ? 1 : -1);
            }}
            initial={{ scale: .86, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 160, damping: 17 }}
            style={{ cursor: 'grab', touchAction: 'pan-y', position: 'relative' }}>

            <AnimatePresence mode="wait">
              <motion.div key={cur.id}
                initial={{ opacity: 0, x: 40, scale: .94 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -40, scale: .94 }}
                transition={{ type: 'spring', stiffness: 220, damping: 22 }}>
                {hasCut(cur.id)
                  ? <Cutout src={cutUrl(cur.id)} maxH="min(50vh, 460px)" onPoke={() => animalSound(cur.id)} />
                  : <Sticker src={photoUrl(cur.id)} maxH="min(50vh, 460px)" onPoke={() => animalSound(cur.id)} />}
              </motion.div>
            </AnimatePresence>

            {/* носик этого зверя — кружком поверх, чтобы тема домика была видна */}
            <motion.button className="nose-chip" onClick={() => { blip(700); nav(`/animal/${cur.id}`); }}
              aria-label={`Открыть: ${cur.ru}`}
              whileHover={{ scale: 1.06 }} whileTap={{ scale: .92 }}>
              <img src={noseUrl(cur.id)} alt="" />
            </motion.button>
          </motion.div>

          <div>
            <motion.div initial={{ x: 24, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              transition={{ delay: .12, type: 'spring', stiffness: 170, damping: 18 }}>
              <h1>{t.name}</h1>
            </motion.div>
            <motion.p className="lead"
              initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .24 }}
              style={{ margin: '16px 0 22px' }}>
              {t.kid}
            </motion.p>

            <div className="carousel-now">
              <strong>{cur.ru}</strong>
              {pets.length > 1 ? ' · тяни вбок' : ' · такой носик только у него'}
            </div>

            {pets.length > 1 && (
              <div className="dots" role="group" aria-label="Звери этого домика">
                {pets.map((p, i) => (
                  <button key={p.id} className={'dot' + (i === k % pets.length ? ' dot--on' : '')}
                    aria-label={p.ru} onClick={() => { setK(i); blip(600);
                      say(`a-${p.id}-name`).then(() => animalSound(p.id)); }} />
                ))}
              </div>
            )}

            <motion.button className="btn btn--quiet"
              initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .34 }}
              style={{ marginTop: 18 }}
              onClick={() => { blip(600); say(`t-${t.id}-why`); }}>
              <IconSound size={26} /> Почему так?
            </motion.button>
          </div>
        </div>

        <h2 style={{ margin: '0 0 18px' }}>
          Тут живёт {pets.length} {plural(pets.length, 'носик', 'носика', 'носиков')}
        </h2>

        <div className="beasts">
          {pets.map((a, i) => (
            <motion.button key={a.id} className="beast"
              initial={{ opacity: 0, scale: .9, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: .05 + i * .035, type: 'spring', stiffness: 200, damping: 20 }}
              whileHover={{ y: -7 }} whileTap={{ scale: .95 }}
              onClick={() => { blip(540); nav(`/animal/${a.id}`); }}>
              <span className="beast__disc">
                <img src={tileUrl(a.id)} className={hasCut(a.id) ? '' : 'is-photo'}
                     alt={a.ru} loading="lazy" />
              </span>
              <span>{a.ru}</span>
            </motion.button>
          ))}
        </div>

        <details className="note" style={{ marginTop: 28 }}>
          <summary className="adult-toggle" style={{ listStyle: 'none', cursor: 'pointer' }}>i  Для взрослых</summary>
          <h4 style={{ marginTop: 14 }}>Для взрослых</h4>
          <p style={{ margin: 0 }}>{t.parent}</p>
          <div className="note__src">
            Источник: {t.sources.map((s, i) => (
              <span key={s.url}>{i > 0 && ' · '}
                <a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></span>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
