import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { unlock, say, blip } from '../lib/audio';
import { photoUrl } from '../lib/content';
import { Scene } from '../components/Scene';
import { BlobPhoto } from '../components/BlobPhoto';
import { IconPlay } from '../components/Icon';

// Слово появляется по буквам — ребёнок ещё не читает, но видит, что с ним «разговаривают».
const WORD = 'Носики'.split('');

export default function Home() {
  const nav = useNavigate();
  const start = () => { unlock(); blip(620); say('ui-hello'); setTimeout(() => nav('/types'), 260); };

  return (
    <div className="screen" style={{ justifyContent: 'center' }}>
      <Scene from="#FFE2A8" to="#FFB49A" accent="#FFF6E3" />
      <div className="wrap" style={{ display: 'grid', gap: 'clamp(24px,4vw,64px)',
                                     gridTemplateColumns: 'minmax(280px,1fr) minmax(260px,480px)',
                                     alignItems: 'center' }}>
        <div>
          <h1 style={{ display: 'flex', flexWrap: 'wrap' }}>
            {WORD.map((ch, i) => (
              <motion.span key={i}
                initial={{ y: 90, opacity: 0, rotate: -12 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                transition={{ delay: .08 + i * .07, type: 'spring', stiffness: 260, damping: 14 }}
                style={{ display: 'inline-block' }}>
                {ch}
              </motion.span>
            ))}
          </h1>

          <motion.p className="lead"
            initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ delay: .62, type: 'spring', stiffness: 160, damping: 18 }}
            style={{ margin: '18px 0 34px' }}>
            У кого какой нос и почему он такой
          </motion.p>

          <motion.button className="btn" onClick={start}
            initial={{ scale: .6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: .78, type: 'spring', stiffness: 240, damping: 12 }}
            whileTap={{ scale: .93 }}>
            <IconPlay size={30} /> Смотреть
          </motion.button>
        </div>

        <motion.div
          initial={{ scale: .72, opacity: 0, rotate: -6 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ delay: .25, type: 'spring', stiffness: 150, damping: 15 }}>
          <motion.div animate={{ y: [0, -18, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
            <BlobPhoto src={photoUrl('elephant')} lens={false} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
