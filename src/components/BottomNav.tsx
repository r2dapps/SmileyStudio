import React from 'react';
import { NavLink } from 'react-router-dom';
import { Mic, Sliders, Music, FolderHeart, Music2 } from 'lucide-react';
import { soundEffects } from '../utils/audioFeedback';
import { useStudioStore } from '../store/useStudioStore';

export const BottomNav: React.FC = () => {
  const appTheme = useStudioStore((state) => state.appTheme);

  const themeActiveColors: Record<string, string> = {
    neonPink: 'text-pink-400 bg-pink-500/10 border-pink-500/25 drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]',
    cyberBlue: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]',
    emeraldStage: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]',
    amberSunset: 'text-amber-400 bg-amber-500/10 border-amber-500/25 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]',
  };

  const activeClass = themeActiveColors[appTheme] ?? themeActiveColors.neonPink;

  const navItems = [
    { to: '/', icon: Mic, label: 'Studio' },
    { to: '/fx', icon: Sliders, label: 'FX Rack' },
    { to: '/tracks', icon: Music, label: 'Tracks' },
    { to: '/vault', icon: FolderHeart, label: 'My Songs' },
    { to: '/practice', icon: Music2, label: 'Practice' },
  ];

  return (
    <nav className="w-full glassmorphism border-t border-slate-800/80 px-1 py-2 z-50 shrink-0">
      <div className="flex justify-around items-center w-full">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={() => soundEffects.playClickChime()}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all duration-200 cursor-pointer select-none border ${
                isActive
                  ? `font-bold ${activeClass}`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-5 h-5 mb-1 transition-all ${
                    isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'
                  }`}
                />
                <span className="text-[10px] tracking-tight whitespace-nowrap">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
