import React from 'react';
import { Headphones, Settings, Heart, Mic } from 'lucide-react';
import { useStudioStore } from '../store/useStudioStore';
import { useNavigate } from 'react-router-dom';
import { soundEffects } from '../utils/audioFeedback';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const isRecording = useStudioStore((state) => state.isRecording);
  const liveMonitor = useStudioStore((state) => state.liveMonitor);
  const toggleLiveMonitor = useStudioStore((state) => state.toggleLiveMonitor);

  const handleMonitorToggle = () => {
    soundEffects.playClickChime();
    toggleLiveMonitor();
  };

  const handleSettingsClick = () => {
    soundEffects.playClickChime();
    navigate('/settings');
  };

  return (
    <header className="sticky top-0 z-50 glassmorphism px-4 py-3 border-b border-slate-800 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {/* Mic icon — color driven by CSS var(--accent) for all themes */}
        <Mic
          className={`w-5 h-5 transition-transform ${isRecording ? 'animate-bounce' : ''}`}
          style={{ color: isRecording ? '#ef4444' : 'var(--accent)' }}
        />
        <div className="flex items-center space-x-1.5">
          <h1
            className="font-black text-lg tracking-wider"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Smiley Studio
          </h1>
          <Heart className="w-4 h-4" style={{ color: 'var(--accent)' }} />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={handleMonitorToggle}
          className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1.5 transition active:scale-95 border ${
            liveMonitor
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
          }`}
          title="Toggle Live Ear Monitor"
        >
          <Headphones className="w-3.5 h-3.5" />
          <span>{liveMonitor ? 'Monitor On' : 'Ear Monitor'}</span>
        </button>

        <button
          onClick={handleSettingsClick}
          className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800/80 border border-slate-700 transition"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
