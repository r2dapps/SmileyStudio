import React from 'react';
import { useStudioStore } from '../store/useStudioStore';
import { Upload, Music, Volume2 } from 'lucide-react';

export const TracksPage: React.FC = () => {
  const backingTrackName = useStudioStore((state) => state.backingTrackName);
  const setBackingTrack = useStudioStore((state) => state.setBackingTrack);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackingTrack(file.name);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="border-b border-slate-800 pb-2">
        <h1 className="text-base font-bold">Karaoke Backing Tracks</h1>
        <p className="text-xs text-slate-400">Load backing songs & compose vocal harmonies</p>
      </div>

      <div className="glassmorphism p-4 rounded-2xl space-y-4 border border-slate-800">
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Backing Track File</h2>
          <label className="text-xs text-pink-400 cursor-pointer font-bold bg-pink-500/10 px-3 py-1.5 rounded-lg border border-pink-500/30 flex items-center space-x-1 hover:bg-pink-500/20 transition">
            <Upload className="w-3.5 h-3.5" />
            <span>Load Song</span>
            <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>

        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center space-x-3">
          <Music className="w-5 h-5 text-pink-400" />
          <div className="truncate text-xs font-medium text-slate-300">
            {backingTrackName ? backingTrackName : 'No backing track loaded yet...'}
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5 font-medium">
            <span className="text-slate-300 flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-slate-400" /> Track vs Mic Balance
            </span>
            <span className="text-pink-400 font-mono">50 / 50</span>
          </div>
          <input type="range" min="0" max="100" defaultValue="50" className="w-full" />
        </div>
      </div>
    </div>
  );
};
