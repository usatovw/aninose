import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Nav } from '../components/Chrome';
import { Scene } from '../components/Scene';
import { BlobPhoto } from '../components/BlobPhoto';
import { Burst } from '../components/Burst';
import { animals, photoUrl, noseUrl } from '../lib/content';
import { say, blip, animalSound } from '../lib/audio';
import { useNavigate } from 'react-router-dom';

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - .5);

/** «Чей это носик?» — крупный настоящий нос и три фото на выбор. */
export default function Game() {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [won, setWon] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const nav = useNavigate();

  const { answer, options } = useMemo(() => {
    const answer = shuffle(animals)[0];
    const others = shuffle(animals.filter(a => a.id !== answer.id)).slice(0, 2);
    return { answer, options: shuffle([answer, ...others]) };
  }, [round]);

  useEffect(() => { say('ui-game'); setWrong(null); }, [round]);

  const choose = (id: string) => {
    if (id === answer.id) {
      setScore(s => s + 1); setWon(w => w + 1); blip(900); say('ui-yes');
      setTimeout(() => animalSound(answer.id), 650);
      setTimeout(() => setRound(r => r + 1), 2300);
    } else {
      setWrong(id); blip(240); say('ui-no');
      setTimeout(() => setWrong(null), 900);
    }
  };

  return (
    <div className="screen">
      <Scene from="#FFE6B8" to="#FFB6C6" accent="#FFFFFF" seed={round} />
      <div className="wrap" style={{ textAlign: 'center' }}>
        <Nav />
        <motion.h1 initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          Чей это носик?
        </motion.h1>
        <p className="lead" style={{ margin: '12px auto 22px', color: 'var(--ink-soft)' }}>
          Угадала {score} раз
        </p>

        <div style={{ position: 'relative', width: 'clamp(230px,32vw,330px)', margin: '0 auto 30px' }}>
          <Burst on={won} />
          <AnimatePresence mode="wait">
            <motion.div key={answer.id}
              initial={{ scale: .7, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: .8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 17 }}>
              <BlobPhoto src={noseUrl(answer.id)} lens={false} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div style={{ display: 'flex', gap: 'clamp(12px,2vw,26px)', justifyContent: 'center', flexWrap: 'wrap' }}>
          {options.map((o, i) => (
            <motion.button key={o.id + round} className="beast"
              style={{ width: 'clamp(140px,19vw,200px)' }}
              initial={{ y: 26, opacity: 0 }} animate={{
                y: 0, opacity: 1,
                x: wrong === o.id ? [0, -11, 11, -7, 0] : 0,
              }}
              transition={{ delay: i * .07, type: 'spring', stiffness: 220, damping: 18 }}
              whileHover={{ y: -8 }} whileTap={{ scale: .94 }}
              onClick={() => choose(o.id)}>
              <img src={photoUrl(o.id)} alt={o.ru} />
              <span>{o.ru}</span>
            </motion.button>
          ))}
        </div>

        <button className="btn btn--quiet" style={{ marginTop: 30 }}
          onClick={() => { blip(560); nav('/sort'); }}>
          Другая игра: отнеси носик домой
        </button>
      </div>
    </div>
  );
}
