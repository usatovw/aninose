import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Nav } from '../components/Chrome';
import { Scene } from '../components/Scene';
import { noseTypes, animalsOfType, tileUrl, faceOfType, hasCut, cutMask, animals } from '../lib/content';
import { say, sayAfter, blip } from '../lib/audio';
import { IconDice } from '../components/Icon';

export default function TypesMap() {
  const nav = useNavigate();
  // не перебиваем приветствие с заставки — ждём, пока оно договорит
  useEffect(() => { sayAfter('ui-pick'); }, []);
  return (
    <div className="screen">
      <Scene from="#FFF1D4" to="#FFD9C0" accent="#FFFFFF" />
      <div className="wrap">
        <Nav />
        <motion.div initial={{ y: 22, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 160, damping: 18 }}
          style={{ marginBottom: 'clamp(20px,3vh,40px)' }}>
          <h1>Какие бывают<br />носики</h1>
          <p className="lead" style={{ marginTop: 14, color: 'var(--ink-soft)' }}>
            Выбирай домик — посмотрим, кто там живёт
          </p>
          <button className="btn" style={{ marginTop: 18 }}
            onClick={() => { blip(700);
              const r = animals[Math.floor(Math.random() * animals.length)];
              nav(`/animal/${r.id}`); }}>
            <IconDice size={28} /> Удиви меня
          </button>
        </motion.div>

        <div className="types">
          {noseTypes.map((t, i) => {
            const pets = animalsOfType(t.id);
            const face = faceOfType(t.id);
            return (
              <motion.button key={t.id} className="house"
                style={{ background: t.palette.from }}
                initial={{ opacity: 0, y: 34, scale: .94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * .055, type: 'spring', stiffness: 190, damping: 20 }}
                whileHover={{ y: -8, scale: 1.015 }} whileTap={{ scale: .97 }}
                onClick={() => { blip(560); say(`t-${t.id}-name`); setTimeout(() => nav(`/type/${t.id}`), 850); }}>
                <span className="house__glow" />
                <span className="house__shadow" />
                <span className="house__pet-slot">
                  <motion.img className="house__pet" src={tileUrl(face.id)} alt="" loading="lazy"
                    style={hasCut(face.id) ? cutMask(face.id) : { borderRadius: 26, boxShadow: '0 0 0 8px #fff' }}
                    whileHover={{ y: -8, scale: 1.04 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 16 }} />
                </span>
                <span className="house__count">{pets.length}</span>
                <span className="house__name">{t.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
