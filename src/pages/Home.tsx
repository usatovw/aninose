import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { unlock, say, blip, animalSound } from '../lib/audio';
import { photoUrl } from '../lib/content';
import { Scene } from '../components/Scene';
import { BlobPhoto } from '../components/BlobPhoto';
import { IconPlay } from '../components/Icon';

const WORD = 'Носики'.split('');
// Носики-спутники: узнаваемые кадры по кругу — ребёнок видит, про что это, не читая.
// Узнаваемые звери по краям: ребёнок понимает, про что это, не читая,
// и может потыкать в них ещё до кнопки «Смотреть».
const ORBIT = [
  { id: 'cow',     x: 8,  y: 74, s: 104 },
  { id: 'pig',     x: 26, y: 86, s: 86  },
  { id: 'duck',    x: 46, y: 80, s: 82  },
  { id: 'dog',     x: 64, y: 88, s: 92  },
  { id: 'giraffe', x: 82, y: 72, s: 96  },
  { id: 'horse',   x: 74, y: 14, s: 80  },
];

export default function Home() {
  const nav = useNavigate();
  const start = () => { unlock(); blip(620); say('ui-hello'); setTimeout(() => nav('/types'), 240); };

  return (
    <div className="screen" style={{ justifyContent: 'center', position: 'relative' }}>
      <Scene from="#FFE0A6" to="#FFAE93" accent="#FFF8EC" />

      {ORBIT.map((o, i) => (
        <motion.button key={o.id} className="orbit-dot" aria-label={`Послушать: ${o.id}`}
          onClick={() => { unlock(); blip(700); say(`a-${o.id}-name`).then(() => animalSound(o.id)); }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: .88 }}
          transition={{ delay: .5 + i * .09, type: 'spring', stiffness: 200, damping: 13 }}
          style={{ left: `${o.x}%`, top: `${o.y}%`, width: o.s, height: o.s }}>
          <img src={photoUrl(o.id)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </motion.button>
      ))}

      <div className="wrap" style={{ display: 'grid', gap: 'clamp(20px,3vw,56px)',
                                     gridTemplateColumns: 'minmax(280px,1.1fr) minmax(250px,420px)',
                                     alignItems: 'center', position: 'relative', zIndex: 2 }}>
        <div>
          <h1 style={{ display: 'flex', flexWrap: 'wrap', fontSize: 'clamp(56px, 11vw, 150px)' }}>
            {WORD.map((ch, i) => (
              <motion.span key={i}
                initial={{ y: 110, opacity: 0, rotate: -14, scale: .8 }}
                animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
                transition={{ delay: .1 + i * .075, type: 'spring', stiffness: 250, damping: 13 }}
                style={{ display: 'inline-block' }}>{ch}</motion.span>
            ))}
          </h1>
          <motion.p className="lead"
            initial={{ y: 22, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ delay: .66, type: 'spring', stiffness: 170, damping: 19 }}
            style={{ margin: '14px 0 32px', fontSize: 'clamp(21px,2.3vw,32px)' }}>
            У кого какой нос и почему он такой
          </motion.p>
          <motion.button className="btn" onClick={start}
            initial={{ scale: .5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: .8, type: 'spring', stiffness: 250, damping: 12 }}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: .93 }}
            style={{ minHeight: 100, padding: '0 50px', fontSize: 'clamp(23px,2.4vw,34px)' }}>
            <IconPlay size={32} /> Смотреть
          </motion.button>
        </div>

        <motion.div
          initial={{ scale: .7, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ delay: .22, type: 'spring', stiffness: 150, damping: 15 }}>
          <motion.div animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}>
            <BlobPhoto src={photoUrl('elephant')} lens={false} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
