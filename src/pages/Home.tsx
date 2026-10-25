import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { unlock, say, blip, animalSound } from '../lib/audio';
import { cutUrl, cutMask } from '../lib/content';
import { Scene } from '../components/Scene';
import { IconPlay } from '../components/Icon';

const WORD = 'Носики'.split('');
// Звери-силуэты вокруг заголовка: ребёнок видит, про что это, не читая,
// и может потыкать в них ещё до кнопки «Смотреть». Только те, у кого
// вырез из фона чистый — иначе на заливке будет висеть обрезок фотографии.
const ORBIT = [
  { id: 'sheep',  h: 150, d: -4 },
  { id: 'pig',    h: 120, d:  3 },
  { id: 'duck',   h: 128, d: -3 },
  { id: 'dog',    h: 146, d:  4 },
  { id: 'rabbit', h: 132, d: -2 },
  { id: 'goat',   h: 140, d:  3 },
];

export default function Home() {
  const nav = useNavigate();
  const reduce = useReducedMotion();
  const start = () => { unlock(); blip(620); say('ui-hello'); setTimeout(() => nav('/types'), 240); };

  return (
    <div className="screen" style={{ justifyContent: 'center', position: 'relative',
                                     paddingBottom: 'clamp(28px, 20vh, 190px)' }}>
      <Scene from="#FFE0A6" to="#FFF4D8" />

      {/* звери стоят на земле вдоль нижнего края — ряд персонажей,
          а не кружки поверх текста: композиция вместо россыпи */}
      <div className="orbit-row" aria-label="Звери: нажми и послушай">
        {ORBIT.map((o, i) => (
          <motion.button key={o.id} className="orbit-pet" aria-label={`Послушать: ${o.id}`}
            onClick={() => { unlock(); blip(700); say(`a-${o.id}-name`).then(() => animalSound(o.id)); }}
            initial={{ y: 120, opacity: 0, rotate: o.d * 2 }}
            animate={{ y: 0, opacity: 1, rotate: o.d }}
            whileHover={{ y: -14, rotate: 0, scale: 1.06 }} whileTap={{ scale: .92 }}
            transition={{ delay: .55 + i * .09, type: 'spring', stiffness: 200, damping: 15 }}
            style={{ height: o.h }}>
            <motion.img src={cutUrl(o.id)} alt="" style={cutMask(o.id)}
              animate={reduce ? {} : { y: [0, -7, 0] }}
              transition={{ duration: 5 + i * .7, repeat: Infinity, ease: 'easeInOut' }} />
          </motion.button>
        ))}
      </div>

      <div className="wrap home-grid">
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

        {/* герой заставки — жираф: именно про него Стеша спросила первым делом */}
        <motion.div
          initial={{ scale: .7, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ delay: .22, type: 'spring', stiffness: 150, damping: 15 }}
          style={{ position: 'relative' }}>
          <div aria-hidden style={{ position: 'absolute', left: '14%', right: '14%', bottom: '-4%',
                                    height: 26, borderRadius: '50%', background: 'rgba(70,40,15,.26)',
                                    filter: 'blur(16px)' }} />
          <motion.img src={cutUrl('giraffe')} alt="" draggable={false}
            animate={reduce ? {} : { y: [0, -18, 0], rotate: [-1.5, 1.5, -1.5] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: '100%', position: 'relative', ...cutMask('giraffe'),
                     filter: 'drop-shadow(0 18px 20px rgba(70,40,15,.22))' }} />
        </motion.div>
      </div>
    </div>
  );
}
