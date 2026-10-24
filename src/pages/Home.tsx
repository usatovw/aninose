import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { unlock, say, blip } from '../lib/audio';
import { animals, photoUrl } from '../lib/content';

// Несколько знакомых морд летают по заставке — ребёнок узнаёт их раньше, чем прочтёт слово.
const FLOAT = ['dog', 'cow', 'horse', 'giraffe', 'pig', 'elephant', 'cat', 'duck'];

export default function Home() {
  const nav = useNavigate();
  const start = async () => {
    unlock(); blip(620);           // первое касание разблокирует звук в браузере
    nav('/types');
    say('ui-hello');
  };
  return (
    <div className="page" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <div className="hero-bg" style={{ background: 'linear-gradient(160deg,#FFE3B0 0%,#FFB3C7 55%,#C3B4F0 100%)' }} />
      <div style={{ textAlign: 'center', position: 'relative', width: '100%', maxWidth: 1100 }}>
        {FLOAT.map((id, i) => (
          <motion.img
            key={id} src={photoUrl(id)} alt=""
            initial={{ opacity: 0, scale: .4 }}
            animate={{ opacity: 1, scale: 1, y: [0, -16, 0] }}
            transition={{ opacity: { delay: i * .08 }, scale: { delay: i * .08, type: 'spring', bounce: .5 },
                          y: { duration: 3 + i * .3, repeat: Infinity, ease: 'easeInOut' } }}
            style={{
              position: 'absolute', width: 'clamp(64px,9vw,120px)', height: 'clamp(64px,9vw,120px)',
              objectFit: 'cover', borderRadius: '50%', border: '6px solid #fff',
              boxShadow: '0 10px 30px rgba(0,0,0,.18)',
              left: `${[2, 16, 79, 90, 8, 86, 26, 70][i]}%`,
              top: `${[8, -12, -14, 10, 62, 58, 78, 80][i]}%`,
            }}
          />
        ))}
        <motion.h1
          initial={{ scale: .7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: .45 }}
          style={{ fontSize: 'clamp(54px,11vw,140px)', textShadow: '0 6px 0 rgba(255,255,255,.6)' }}
        >
          Носики
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .3 }}
          style={{ fontSize: 'clamp(20px,2.4vw,30px)', fontWeight: 700, marginBottom: 36 }}
        >
          У кого какой нос и почему
        </motion.p>
        <motion.button
          className="pill" onClick={start}
          initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ delay: .45, type: 'spring', bounce: .5 }}
          whileTap={{ scale: .92 }}
          style={{ fontSize: 'clamp(24px,3vw,38px)', padding: '0 54px', minHeight: 110,
                   background: '#fff', boxShadow: '0 16px 40px rgba(0,0,0,.2)' }}
        >
          ▶️ Начать
        </motion.button>
      </div>
    </div>
  );
}
