import React from 'react';
import { Headphones, Settings } from 'lucide-react';
import { useStudioStore } from '../store/useStudioStore';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const isMicActive = useStudioStore((state) => state.isMicActive);
  const isRecording = useStudioStore((state) => state.isRecording);
  const liveMonitor = useStudioStore((state) => state.liveMonitor);
  const toggleLiveMonitor = useStudioStore((state) => state.toggleLiveMonitor);

  return (
    <header className="sticky top-0 z-50 glassmorphism px-4 py-3 border-b border-slate-800 flex items-center justify-between">
      <div className="flex items-center space-x-2.5">
        <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : isMicActive ? 'bg-emerald-500 animate-pulse' : 'bg-pink-500'}`} />
        <h1 className="font-black text-lg tracking-wider bg-gradient-to-r from-pink-500 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Smiley Studio 💖
        </h1>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => toggleLiveMonitor()}
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
          onClick={() => navigate('/settings')}
          className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800/80 border border-slate-700 transition"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
