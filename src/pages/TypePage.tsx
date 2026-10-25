import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Nav } from '../components/Chrome';
import { Scene } from '../components/Scene';
import { BlobPhoto } from '../components/BlobPhoto';
import { IconSound } from '../components/Icon';
import { typeById, animalsOfType, photoUrl, noseUrl } from '../lib/content';
import { say, blip, animalSound } from '../lib/audio';

export default function TypePage() {
  const { id } = useParams();
  const nav = useNavigate();
  const t = typeById(id);
  // «Вертелка»: карусель носиков этого типа — ребёнок крутит и слушает
  const [k, setK] = useState(0);
  useEffect(() => { if (t) { setK(0); say(`t-${t.id}-kid`); } }, [t?.id]);
  if (!t) return <div className="screen"><div className="wrap">Не нашли такой носик</div></div>;
  const pets = animalsOfType(t.id);
  const cur = pets[k % pets.length];

  return (
    <div className="screen">
      <Scene from={t.palette.from} to={t.palette.to} accent="#FFFFFF" />
      <div className="wrap">
        <Nav light />

        <div style={{ display: 'grid', gap: 'clamp(20px,3.5vw,58px)',
                      gridTemplateColumns: 'minmax(280px,420px) minmax(290px,1fr)',
                      alignItems: 'center', marginBottom: 'clamp(26px,4vh,54px)' }}>
          <motion.div
            drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={.45}
            onDragEnd={(_, info) => {
              if (Math.abs(info.offset.x) < 50) return;
              // индекс считаем заранее: cur взят из замыкания и после setK ещё старый,
              // из-за чего карусель озвучивала предыдущего зверя
              const nextIdx = (k + (info.offset.x < 0 ? 1 : pets.length - 1)) % pets.length;
              setK(nextIdx); blip(620);
              const nx = pets[nextIdx];
              say(`a-${nx.id}-name`).then(() => animalSound(nx.id));
            }}
            initial={{ scale: .82, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 160, damping: 17 }}
            style={{ cursor: 'grab', touchAction: 'pan-y' }}>
            <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}>
              <BlobPhoto key={cur.id} src={noseUrl(cur.id)} lens={false} />
            </motion.div>
            <div style={{ textAlign: 'center', marginTop: 14, color: '#fff', fontWeight: 800,
                          textShadow: '0 2px 12px rgba(0,0,0,.32)' }}>
              {pets.length > 1
                ? <>Это носик: {cur.ru} · тяни вбок</>
                : <>Это носик: {cur.ru} · такой только у него одного!</>}
            </div>
          </motion.div>

          <div>
            <motion.div initial={{ x: 24, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              transition={{ delay: .12, type: 'spring', stiffness: 170, damping: 18 }}>
              <h1 style={{ color: '#fff', textShadow: '0 4px 22px rgba(0,0,0,.26)' }}>{t.name}</h1>
            </motion.div>
            <motion.p className="lead"
              initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .24 }}
              style={{ color: '#fff', textShadow: '0 2px 16px rgba(0,0,0,.3)', margin: '16px 0 24px' }}>
              {t.kid}
            </motion.p>
            <motion.button className="btn btn--quiet"
              initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .34 }}
              onClick={() => { blip(600); say(`t-${t.id}-why`); }}>
              <IconSound size={26} /> Почему так?
            </motion.button>
          </div>
        </div>

        <div className="beasts">
          {pets.map((a, i) => (
            <motion.button key={a.id} className="beast"
              initial={{ opacity: 0, scale: .9, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: .05 + i * .035, type: 'spring', stiffness: 200, damping: 20 }}
              whileHover={{ y: -7 }} whileTap={{ scale: .95 }}
              onClick={() => { blip(540); nav(`/animal/${a.id}`); }}>
              <img src={photoUrl(a.id)} alt={a.ru} loading="lazy" />
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
