import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Nav } from '../components/Chrome';
import { Scene } from '../components/Scene';
import { noseTypes, animalsOfType, photoUrl } from '../lib/content';
import { say, blip } from '../lib/audio';

export default function TypesMap() {
  const nav = useNavigate();
  useEffect(() => { say('ui-pick'); }, []);
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
        </motion.div>

        <div className="types">
          {noseTypes.map((t, i) => {
            const pets = animalsOfType(t.id);
            const face = pets[0];
            return (
              <motion.button key={t.id} className="type-card"
                initial={{ opacity: 0, y: 34, scale: .94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * .055, type: 'spring', stiffness: 190, damping: 20 }}
                whileHover={{ y: -8, scale: 1.015 }} whileTap={{ scale: .97 }}
                onClick={() => { blip(560); say(`t-${t.id}-name`); setTimeout(() => nav(`/type/${t.id}`), 850); }}>
                <motion.img className="type-card__photo" src={photoUrl(face.id)} alt="" loading="lazy"
                  initial={{ scale: 1.14 }} whileHover={{ scale: 1.2 }}
                  transition={{ duration: 1.1, ease: [.2, .8, .3, 1] }} />
                <div className="type-card__veil"
                     style={{ background: `linear-gradient(145deg, ${t.palette.from}, ${t.palette.to})` }} />
                <div style={{ position: 'absolute', inset: 0,
                              background: 'linear-gradient(180deg, transparent 38%, rgba(0,0,0,.42))' }} />
                <span className="type-card__count">{pets.length}</span>
                <span className="type-card__name">{t.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
