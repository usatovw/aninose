import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Nav } from '../components/Chrome';
import { Scene } from '../components/Scene';
import { animals, tileUrl, hasCut, plural, noseTypes, aliasesOf } from '../lib/content';
import { seen, syncFromServer } from '../lib/progress';
import { sayAfter, blip } from '../lib/audio';

export default function Album() {
  const nav = useNavigate();
  const [ids, setIds] = useState<Set<string>>(seen());
  const [q, setQ] = useState('');
  useEffect(() => { syncFromServer().then(() => setIds(seen())); sayAfter('ui-album'); }, []);
  const found = animals.filter(a => ids.has(a.id)).length;

  // Поиск для взрослого: ребёнок не читает и не печатает, но папе нужно
  // быстро ответить на «а где собачка?». Ищем и по имени зверя, и по типу носа.
  const needle = q.trim().toLowerCase();
  const typeName = (id: string) => noseTypes.find(t => t.id === id)?.name ?? '';
  const list = needle
    ? animals.filter(a => a.ru.toLowerCase().includes(needle)
                       || typeName(a.type).toLowerCase().includes(needle)
                       || aliasesOf(a.id).some(x => x.includes(needle)))
    : animals;
  const pct = found / animals.length;

  return (
    <div className="screen">
      <Scene from="#FFF0DA" to="#E9DCFF" accent="#FFFFFF" />
      <div className="wrap">
        <Nav />
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h1>Мой альбом</h1>
          <p className="lead" style={{ marginTop: 12, color: 'var(--ink-soft)' }}>
            Нашла {found} {plural(found, 'носик', 'носика', 'носиков')} из {animals.length}
          </p>
        </motion.div>

        <div style={{ height: 20, borderRadius: 999, background: 'rgba(255,255,255,.7)',
                      overflow: 'hidden', margin: '16px 0 30px', boxShadow: 'inset 0 2px 6px rgba(90,58,30,.1)' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct * 100}%` }}
            transition={{ duration: 1.1, ease: [.2, .8, .3, 1] }}
            style={{ height: '100%', background: 'linear-gradient(90deg,#FFC46B,#F2603C)' }} />
        </div>

        <div className="album-tools">
          <input
            className="search" type="search" inputMode="search"
            placeholder="Найти зверя: собака, хобот…"
            value={q} onChange={e => setQ(e.target.value)}
            aria-label="Поиск по животным и типам носов" />
          {needle && (
            <button className="search-clear" onClick={() => setQ('')} aria-label="Очистить поиск">×</button>
          )}
        </div>
        <p style={{ fontWeight: 700, color: 'var(--ink-soft)', marginBottom: 14 }}>
          {needle
            ? `Нашлось: ${list.length}`
            : 'Цветные — те, кого Стеша уже нашла. Нажми на любого, чтобы открыть.'}
        </p>

        <div className="beasts">
          {list.length === 0 && (
            <p style={{ gridColumn: '1/-1', color: 'var(--ink-soft)', fontWeight: 700 }}>
              Такого зверя у нас пока нет. Попробуй: корова, хобот, пятачок.
            </p>
          )}
          {list.map((a, i) => {
            const got = ids.has(a.id);
            return (
              <motion.button key={a.id} className="beast"
                initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(i * .018, .7), type: 'spring', stiffness: 210, damping: 20 }}
                whileHover={{ y: -6 }} whileTap={{ scale: .95 }}
                onClick={() => { blip(got ? 660 : 400); nav(`/animal/${a.id}`); }}>
                <span className="beast__disc">
                  <img src={tileUrl(a.id)} className={hasCut(a.id) ? '' : 'is-photo'}
                    alt={a.ru} loading="lazy"
                    style={{ filter: got ? undefined : 'grayscale(1) contrast(.85) brightness(1.08)',
                             opacity: got ? 1 : .55 }} />
                </span>
                <span>{a.ru}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
