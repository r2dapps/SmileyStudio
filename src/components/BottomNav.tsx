import React from 'react';
import { NavLink } from 'react-router-dom';
import { Mic, Sliders, Music, FolderHeart, Music2, Settings } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/', icon: Mic, label: 'Studio' },
    { to: '/fx', icon: Sliders, label: 'FX Rack' },
    { to: '/tracks', icon: Music, label: 'Tracks' },
    { to: '/vault', icon: FolderHeart, label: 'Vault' },
    { to: '/practice', icon: Music2, label: 'Practice' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glassmorphism border-t border-slate-800/80 px-2 py-2 max-w-lg mx-auto">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center space-y-1 py-1 px-3 rounded-2xl transition duration-200 ${
                isActive
                  ? 'text-pink-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 transition ${isActive ? 'stroke-[2.5px] text-pink-400 filter drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]' : 'stroke-[1.75px]'}`} />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
