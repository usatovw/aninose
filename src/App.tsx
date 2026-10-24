import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import Home from './pages/Home';
import TypesMap from './pages/TypesMap';
import TypePage from './pages/TypePage';
import AnimalPage from './pages/AnimalPage';
import Game from './pages/Game';
import Album from './pages/Album';
import { unlock } from './lib/audio';

export default function App() {
  const loc = useLocation();
  // Браузер не даёт играть звук до жеста — ловим любой первый жест, не только кнопку «Начать».
  useEffect(() => {
    const on = () => unlock();
    window.addEventListener('pointerdown', on, { once: true });
    window.addEventListener('keydown', on, { once: true });
    return () => { window.removeEventListener('pointerdown', on); window.removeEventListener('keydown', on); };
  }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.div key={loc.pathname}
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
        transition={{ duration: .22 }}>
        <Routes location={loc}>
          <Route path="/" element={<Home />} />
          <Route path="/types" element={<TypesMap />} />
          <Route path="/type/:id" element={<TypePage />} />
          <Route path="/animal/:id" element={<AnimalPage />} />
          <Route path="/game" element={<Game />} />
          <Route path="/album" element={<Album />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
