import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { TopBar } from '../components/Chrome';
import { typeById, animalsOfType, photoUrl, noseUrl, gradient } from '../lib/content';
import { say, blip } from '../lib/audio';

export default function TypePage() {
  const { id } = useParams();
  const nav = useNavigate();
  const t = typeById(id);
  useEffect(() => { if (t) say(`t-${t.id}-kid`); }, [t?.id]);
  if (!t) return <div className="page">Не нашли такой носик</div>;
  const pets = animalsOfType(t.id);

  return (
    <div className="page">
      <div className="hero-bg" style={{ background: gradient(t.palette), opacity: .35 }} />
      <div className="wrap">
        <TopBar />

        <motion.div initial={{ scale: .9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: .4 }}
          style={{ background: gradient(t.palette), borderRadius: 'var(--r-lg)', padding: '30px 32px',
                   color: '#fff', marginBottom: 22, boxShadow: 'var(--shadow-pop)' }}>
          <motion.div animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: 74, lineHeight: 1 }}>{t.emoji}</motion.div>
          <h1 style={{ textShadow: '0 3px 14px rgba(0,0,0,.25)' }}>{t.name}</h1>
          <p style={{ fontSize: 'clamp(21px,2vw,29px)', fontWeight: 700, maxWidth: '36ch' }}>{t.kid}</p>

          <button className="pill" style={{ marginTop: 10, color: 'var(--ink)' }}
            onClick={() => { blip(600); say(`t-${t.id}-why`); }}>
            🔊 Почему так?
          </button>
        </motion.div>

        <h2>Кто такой носик носит</h2>
        <div className="grid-animals" style={{ marginBottom: 28 }}>
          {pets.map((a, i) => (
            <motion.button key={a.id} className="card"
              initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * .04, type: 'spring', bounce: .4 }}
              whileHover={{ y: -5 }} whileTap={{ scale: .95 }}
              onClick={() => { blip(520); nav(`/animal/${a.id}`); }}>
              <img className="card-photo" src={photoUrl(a.id)} alt={a.ru} loading="lazy" />
              <img src={noseUrl(a.id)} alt="" loading="lazy"
                style={{ position: 'absolute', right: 8, top: 8, width: 58, height: 58,
                         borderRadius: '50%', objectFit: 'cover', border: '3px solid #fff',
                         boxShadow: '0 4px 14px rgba(0,0,0,.3)' }} />
              <div className="card-label">{a.ru}</div>
            </motion.button>
          ))}
        </div>

        <div className="parent-box">
          <h4>Для взрослых</h4>
          <p style={{ fontSize: 17 }}>{t.parent}</p>
          <div className="src">
            Источник:{' '}
            {t.sources.map((s, i) => (
              <span key={s.url}>{i > 0 && ' · '}<a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
