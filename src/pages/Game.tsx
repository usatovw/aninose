import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TopBar } from '../components/Chrome';
import { animals, photoUrl, noseUrl } from '../lib/content';
import { say, blip, animalSound } from '../lib/audio';

const pick = <T,>(arr: T[], n: number) => [...arr].sort(() => Math.random() - .5).slice(0, n);

/** «Чей это носик?»: показываем настоящий нос крупно, выбираем из трёх фото. */
export default function Game() {
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<'win' | 'miss' | null>(null);
  const [score, setScore] = useState(0);

  const { answer, options } = useMemo(() => {
    const answer = pick(animals, 1)[0];
    const others = pick(animals.filter(a => a.id !== answer.id), 2);
    return { answer, options: pick([answer, ...others], 3) };
  }, [round]);

  useEffect(() => { say('ui-game'); setResult(null); }, [round]);

  const choose = (id: string) => {
    if (result) return;
    if (id === answer.id) {
      setResult('win'); setScore(s => s + 1);
      blip(880); say('ui-yes');
      setTimeout(() => { animalSound(answer.id); }, 700);
      setTimeout(() => setRound(r => r + 1), 2400);
    } else {
      setResult('miss'); blip(240); say('ui-no');
      setTimeout(() => setResult(null), 1100);
    }
  };

  return (
    <div className="page">
      <div className="hero-bg" style={{ background: 'linear-gradient(165deg,#FFE9B0,#FFC6D9 60%,#D6C8FF)' }} />
      <div className="wrap" style={{ textAlign: 'center' }}>
        <TopBar />
        <h1>Чей это носик?</h1>
        <p style={{ fontWeight: 800 }}>Угадала: {score} 🏅</p>

        <motion.img key={answer.id} src={noseUrl(answer.id)} alt="Чей это нос?"
          initial={{ scale: .8, opacity: 0, rotate: -4 }} animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', bounce: .45 }}
          style={{ width: 'clamp(220px,34vw,340px)', height: 'clamp(220px,34vw,340px)',
                   objectFit: 'cover', borderRadius: '50%', margin: '10px auto 26px',
                   border: '10px solid #fff', boxShadow: '0 20px 50px rgba(0,0,0,.22)' }} />

        <div style={{ display: 'flex', gap: 'clamp(12px,2vw,26px)', justifyContent: 'center', flexWrap: 'wrap' }}>
          {options.map(o => (
            <motion.button key={o.id} className="card" whileTap={{ scale: .93 }} whileHover={{ y: -6 }}
              onClick={() => choose(o.id)}
              style={{ width: 'clamp(140px,20vw,210px)' }}>
              <img className="card-photo" src={photoUrl(o.id)} alt={o.ru} />
              <div className="card-label">{o.ru}</div>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {result === 'win' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center',
                       pointerEvents: 'none', fontSize: 'clamp(90px,22vw,260px)' }}>
              🎉
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
