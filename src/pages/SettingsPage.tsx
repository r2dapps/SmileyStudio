import React from 'react';
import { useStudioStore } from '../store/useStudioStore';
import { Settings, ShieldCheck, Smartphone, Info } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const qualityMode = useStudioStore((state) => state.qualityMode);
  const noiseCancellation = useStudioStore((state) => state.noiseCancellation);
  const setParam = useStudioStore((state) => state.setParam);
  const toggleNoiseCancellation = useStudioStore((state) => state.toggleNoiseCancellation);

  return (
    <div className="space-y-4 pb-20">
      <div className="border-b border-slate-800 pb-2">
        <h1 className="text-base font-bold flex items-center space-x-2">
          <Settings className="w-5 h-5 text-pink-400" />
          <span>App Settings</span>
        </h1>
        <p className="text-xs text-slate-400">Configure Audio, Noise Suppressor, and Performance options</p>
      </div>

      {/* Hardware Noise Cancellation */}
      <div className="glassmorphism p-4 rounded-2xl space-y-3 border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-xs font-bold text-white">Hardware Noise Suppression</h2>
              <p className="text-[10px] text-slate-400">Suppresses room hiss, fan noise & acoustic echo</p>
            </div>
          </div>
          <button
            onClick={() => toggleNoiseCancellation()}
            className={`w-12 h-6 rounded-full transition p-1 flex items-center ${
              noiseCancellation ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>
      </div>

      {/* Audio & Performance Section */}
      <div className="glassmorphism p-4 rounded-2xl space-y-3 border border-slate-800">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5 border-b border-slate-800 pb-2">
          <Smartphone className="w-4 h-4 text-pink-400" />
          <span>Mobile Performance Mode</span>
        </h2>

        <div className="grid grid-cols-3 gap-2">
          {(['performance', 'balanced', 'studio'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setParam('qualityMode', mode)}
              className={`p-2.5 rounded-xl border text-xs font-bold capitalize transition ${
                qualityMode === mode
                  ? 'bg-pink-500/20 text-pink-400 border-pink-500'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* About App */}
      <div className="glassmorphism p-4 rounded-2xl space-y-2 border border-slate-800 text-xs text-slate-400">
        <div className="flex items-center space-x-2 font-bold text-slate-200">
          <Info className="w-4 h-4 text-pink-400" />
          <span>Smiley Studio v1.0.0</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Designed specifically for singer <strong className="text-pink-400">Smiley</strong>. Built with React 18, Vite, Web Audio API DSP Engine, and IndexedDB PWA offline storage.
        </p>
      </div>
    </div>
  );
};
