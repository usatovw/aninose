import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { unlock, say, blip } from '../lib/audio';
import { noseUrl, photoUrl } from '../lib/content';
import { Scene } from '../components/Scene';
import { BlobPhoto } from '../components/BlobPhoto';
import { IconPlay } from '../components/Icon';

const WORD = 'Носики'.split('');
// Носики-спутники: узнаваемые кадры по кругу — ребёнок видит, про что это, не читая.
const ORBIT = [
  { id: 'cow',    x: 3,  y: 68, s: 108, d: 6.2 },
  { id: 'pig',    x: 16, y: 86, s: 86,  d: 7.4 },
  { id: 'duck',   x: 40, y: 80, s: 80,  d: 5.6 },
  { id: 'dog',    x: 60, y: 90, s: 92,  d: 8.0 },
  { id: 'giraffe',x: 90, y: 74, s: 98,  d: 6.8 },
  { id: 'snail',  x: 78, y: 12, s: 76,  d: 7.8 },
];

export default function Home() {
  const nav = useNavigate();
  const start = () => { unlock(); blip(620); say('ui-hello'); setTimeout(() => nav('/types'), 240); };

  return (
    <div className="screen" style={{ justifyContent: 'center', position: 'relative' }}>
      <Scene from="#FFE0A6" to="#FFAE93" accent="#FFF8EC" />

      {ORBIT.map((o, i) => (
        <motion.img key={o.id} src={noseUrl(o.id)} alt="" aria-hidden
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, y: [0, -14, 0], rotate: [0, i % 2 ? 5 : -5, 0] }}
          transition={{ scale: { delay: .5 + i * .09, type: 'spring', stiffness: 200, damping: 13 },
                        opacity: { delay: .5 + i * .09 },
                        y: { duration: o.d, repeat: Infinity, ease: 'easeInOut' },
                        rotate: { duration: o.d * 1.4, repeat: Infinity, ease: 'easeInOut' } }}
          style={{ position: 'absolute', left: `${o.x}%`, top: `${o.y}%`,
                   width: o.s, height: o.s, objectFit: 'cover',
                   borderRadius: '54% 46% 48% 52% / 46% 54% 46% 54%',
                   border: '6px solid rgba(255,255,255,.92)',
                   boxShadow: '0 14px 34px rgba(120,70,30,.22)', pointerEvents: 'none' }} />
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
