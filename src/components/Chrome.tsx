import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { blip, stopVoice } from '../lib/audio';
import { IconBack, IconHome, IconMedal, IconDice } from './Icon';

export function Nav({ light = false }: { light?: boolean }) {
  const nav = useNavigate();
  const loc = useLocation();
  const go = (to: string | number) => { blip(430); stopVoice(); nav(to as any); };
  const tint = light ? '#fff' : 'var(--ink)';
  const bg = light ? 'rgba(255,255,255,.22)' : 'rgba(255,255,255,.76)';
  const btn = (key: string, label: string, icon: React.ReactNode, to: string | number) => (
    <motion.button key={key} className="round" aria-label={label}
      style={{ background: bg, color: tint }}
      whileHover={{ scale: 1.08, rotate: key === 'dice' ? 10 : 0 }} whileTap={{ scale: .88 }}
      onClick={() => go(to)}>
      {icon}
    </motion.button>
  );
  return (
    <motion.nav className="nav"
      initial={{ y: -22, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .05 }}>
      {loc.pathname !== '/' && btn('back', 'Назад', <IconBack />, -1)}
      {btn('home', 'Все носики', <IconHome />, '/types')}
      <div className="spacer" />
      {btn('medal', 'Мой альбом', <IconMedal />, '/album')}
      {btn('dice', 'Игра', <IconDice />, '/game')}
    </motion.nav>
  );
}
