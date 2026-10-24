import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/Chrome';
import { noseTypes, animalsOfType, photoUrl, gradient } from '../lib/content';
import { say, blip } from '../lib/audio';

export default function TypesMap() {
  const nav = useNavigate();
  return (
    <div className="page">
      <div className="hero-bg" style={{ background: 'linear-gradient(170deg,#FFF4E2 0%,#FFE9F0 60%,#EEE8FF 100%)' }} />
      <div className="wrap">
        <TopBar />
        <h1 style={{ marginBottom: 6 }}>Какие бывают носики?</h1>
        <p style={{ marginBottom: 26, fontWeight: 700, color: 'var(--ink-soft)' }}>Выбирай домик и смотри, кто там живёт</p>

        <div className="grid-types">
          {noseTypes.map((t, i) => {
            const pets = animalsOfType(t.id);
            return (
              <motion.button
                key={t.id}
                className="card"
                initial={{ opacity: 0, y: 26, scale: .92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * .045, type: 'spring', bounce: .4 }}
                whileHover={{ y: -6 }} whileTap={{ scale: .95 }}
                onClick={() => { blip(560); say(`t-${t.id}-name`); nav(`/type/${t.id}`); }}
                style={{ background: gradient(t.palette), padding: 18, textAlign: 'left', color: '#fff' }}
              >
                <div style={{ fontSize: 54, lineHeight: 1 }}>{t.emoji}</div>
                <div style={{ fontWeight: 900, fontSize: 25, margin: '10px 0 4px',
                              textShadow: '0 2px 10px rgba(0,0,0,.25)' }}>{t.name}</div>
                <div style={{ display: 'flex', gap: -8, marginTop: 12 }}>
                  {pets.slice(0, 5).map((a, k) => (
                    <img key={a.id} src={photoUrl(a.id)} alt="" loading="lazy"
                      style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover',
                               border: '3px solid rgba(255,255,255,.95)', marginLeft: k ? -14 : 0 }} />
                  ))}
                  {pets.length > 5 && (
                    <span style={{ alignSelf: 'center', marginLeft: 10, fontWeight: 900,
                                   textShadow: '0 2px 8px rgba(0,0,0,.3)' }}>+{pets.length - 5}</span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
