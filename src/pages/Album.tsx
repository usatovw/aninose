import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/Chrome';
import { animals, photoUrl } from '../lib/content';
import { seen, syncFromServer } from '../lib/progress';
import { say, blip } from '../lib/audio';

/** Альбом наклеек: найденные носики цветные, ненайденные — серые силуэты. */
export default function Album() {
  const nav = useNavigate();
  const [ids, setIds] = useState<Set<string>>(seen());
  useEffect(() => { syncFromServer().then(() => setIds(seen())); say('ui-album'); }, []);
  const found = animals.filter(a => ids.has(a.id)).length;

  return (
    <div className="page">
      <div className="hero-bg" style={{ background: 'linear-gradient(170deg,#FFF2DC,#FFE2EC 60%,#E6DEFF)' }} />
      <div className="wrap">
        <TopBar />
        <h1>Мой альбом носиков</h1>
        <p style={{ fontWeight: 800, fontSize: 'clamp(22px,2.4vw,32px)' }}>
          Нашла {found} из {animals.length} 🏅
        </p>
        <div style={{ height: 22, borderRadius: 999, background: '#fff', overflow: 'hidden',
                      margin: '12px 0 28px', boxShadow: 'var(--shadow-soft)' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${found / animals.length * 100}%` }}
            transition={{ duration: .9, ease: 'easeOut' }}
            style={{ height: '100%', background: 'linear-gradient(90deg,#FFB3C7,#C3B4F0)' }} />
        </div>

        <div className="grid-animals">
          {animals.map(a => {
            const got = ids.has(a.id);
            return (
              <motion.button key={a.id} className="card" whileTap={{ scale: .94 }}
                onClick={() => { blip(got ? 660 : 380); nav(`/animal/${a.id}`); }}>
                <img className="card-photo" src={photoUrl(a.id)} alt={got ? a.ru : 'Ещё не найден'} loading="lazy"
                  style={{ filter: got ? 'none' : 'grayscale(1) brightness(1.5) contrast(.5)', opacity: got ? 1 : .55 }} />
                <div className="card-label">{got ? a.ru : '?'}</div>
                {got && <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 30 }}>🏅</div>}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
