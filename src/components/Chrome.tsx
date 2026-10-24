import { useNavigate, useLocation } from 'react-router-dom';
import { blip, stopVoice } from '../lib/audio';

/** Навигация без чтения: только иконки, всегда на одном месте. */
export function TopBar({ title }: { title?: string }) {
  const nav = useNavigate();
  const loc = useLocation();
  const go = (to: string | number) => {
    blip(430); stopVoice();
    typeof to === 'number' ? nav(to) : nav(to);
  };
  return (
    <div className="topbar">
      {loc.pathname !== '/' && (
        <button className="big-btn" onClick={() => go(-1)} aria-label="Назад">⬅️</button>
      )}
      <button className="big-btn" onClick={() => go('/types')} aria-label="Все носики">🏠</button>
      {title && <h2 style={{ margin: 0, fontSize: 'clamp(22px,2.6vw,36px)' }}>{title}</h2>}
      <div className="spacer" />
      <button className="big-btn" onClick={() => go('/album')} aria-label="Мой альбом">🏅</button>
      <button className="big-btn" onClick={() => go('/game')} aria-label="Игра">🎲</button>
    </div>
  );
}
