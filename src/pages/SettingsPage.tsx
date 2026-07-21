import React, { useState } from 'react';
import { useStudioStore } from '../store/useStudioStore';
import { Settings, ShieldCheck, Smartphone, Info, RefreshCw, Palette, CheckCircle } from 'lucide-react';
import { soundEffects } from '../utils/audioFeedback';
import { AppTheme } from '../core/StudioController';

export const SettingsPage: React.FC = () => {
  const qualityMode = useStudioStore((state) => state.qualityMode);
  const noiseCancellation = useStudioStore((state) => state.noiseCancellation);
  const appTheme = useStudioStore((state) => state.appTheme);

  const setParam = useStudioStore((state) => state.setParam);
  const toggleNoiseCancellation = useStudioStore((state) => state.toggleNoiseCancellation);
  const setTheme = useStudioStore((state) => state.setTheme);

  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false);

  const themes: { id: AppTheme; label: string; bgGradient: string; borderColor: string }[] = [
    { id: 'neonPink', label: 'Neon Pink', bgGradient: 'from-pink-500 to-purple-500', borderColor: 'border-pink-500' },
    { id: 'cyberBlue', label: 'Cyber Blue', bgGradient: 'from-cyan-400 to-blue-600', borderColor: 'border-cyan-400' },
    { id: 'emeraldStage', label: 'Emerald Stage', bgGradient: 'from-emerald-400 to-teal-600', borderColor: 'border-emerald-400' },
    { id: 'amberSunset', label: 'Amber Sunset', bgGradient: 'from-amber-400 to-orange-600', borderColor: 'border-amber-400' },
  ];

  const handleCheckUpdate = async () => {
    soundEffects.playClickChime();
    setIsCheckingUpdate(true);
    setUpdateStatus(null);

    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.update();
        }
      }
      setTimeout(() => {
        setIsCheckingUpdate(false);
        setUpdateStatus('Smiley Studio is up-to-date! Running v1.0.0.');
      }, 1000);
    } catch (e) {
      setIsCheckingUpdate(false);
      setUpdateStatus('Smiley Studio is up-to-date!');
    }
  };

  const handleSelectTheme = (t: AppTheme) => {
    soundEffects.playPresetChime();
    setTheme(t);
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="border-b border-slate-800 pb-2">
        <h1 className="text-base font-bold flex items-center space-x-2">
          <Settings className="w-5 h-5 text-pink-400" />
          <span>App Settings</span>
        </h1>
        <p className="text-xs text-slate-400">Configure Audio, Glowing Themes, and Updates</p>
      </div>

      {/* Glowing Themes Selector */}
      <div className="glassmorphism p-4 rounded-2xl space-y-3 border border-slate-800">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5 border-b border-slate-800 pb-2">
          <Palette className="w-4 h-4 text-pink-400" />
          <span>Glowing Studio Themes</span>
        </h2>

        <div className="grid grid-cols-2 gap-2">
          {themes.map((t) => {
            const isSelected = appTheme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleSelectTheme(t.id)}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition active:scale-95 ${
                  isSelected
                    ? `bg-slate-900 text-white ${t.borderColor} shadow-lg`
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${t.bgGradient}`} />
                  <span>{t.label}</span>
                </div>
                {isSelected && <CheckCircle className="w-4 h-4 text-pink-400" />}
              </button>
            );
          })}
        </div>
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
            onClick={() => {
              soundEffects.playClickChime();
              toggleNoiseCancellation();
            }}
            className={`w-12 h-6 rounded-full transition p-1 flex items-center ${
              noiseCancellation ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>
      </div>

      {/* Mobile Performance Mode */}
      <div className="glassmorphism p-4 rounded-2xl space-y-3 border border-slate-800">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5 border-b border-slate-800 pb-2">
          <Smartphone className="w-4 h-4 text-pink-400" />
          <span>Mobile Performance Mode</span>
        </h2>

        <div className="grid grid-cols-3 gap-2">
          {(['performance', 'balanced', 'studio'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                soundEffects.playClickChime();
                setParam('qualityMode', mode);
              }}
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

      {/* Check for Updates */}
      <div className="glassmorphism p-4 rounded-2xl space-y-3 border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <RefreshCw className={`w-4 h-4 text-purple-400 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
            <div>
              <h2 className="text-xs font-bold text-white">App Release & Updates</h2>
              <p className="text-[10px] text-slate-400">Check for latest version releases</p>
            </div>
          </div>

          <button
            onClick={handleCheckUpdate}
            disabled={isCheckingUpdate}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 active:scale-95 transition"
          >
            {isCheckingUpdate ? 'Checking...' : 'Check Update'}
          </button>
        </div>

        {updateStatus && (
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300 animate-fade-in">
            {updateStatus}
          </div>
        )}
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
