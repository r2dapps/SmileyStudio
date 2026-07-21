import React from 'react';
import { NavLink } from 'react-router-dom';
import { Mic, Sliders, Music, FolderHeart, Music2 } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/', icon: Mic, label: 'Studio' },
    { to: '/fx', icon: Sliders, label: 'FX Rack' },
    { to: '/tracks', icon: Music, label: 'Tracks' },
    { to: '/vault', icon: FolderHeart, label: 'Vault' },
    { to: '/practice', icon: Music2, label: 'Practice' },
  ];

  return (
    <nav className="w-full glassmorphism border-t border-slate-800/80 px-1 py-2 z-50 shrink-0">
      <div className="flex justify-around items-center w-full">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all duration-200 cursor-pointer select-none ${
                isActive
                  ? 'text-pink-400 font-bold bg-pink-500/10 border border-pink-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-5 h-5 mb-1 transition-all ${
                    isActive
                      ? 'stroke-[2.5px] text-pink-400 filter drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]'
                      : 'stroke-[1.75px]'
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
