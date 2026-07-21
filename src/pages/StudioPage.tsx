import React from 'react';
import { useStudioStore } from '../store/useStudioStore';
import { WaveformCanvas } from '../components/visualizers/WaveformCanvas';
import { PWAInstaller } from '../components/PWAInstaller';
import { Disc, Headphones, Sparkles, Sliders, Radio, Wand2, Flame, AlertCircle, X } from 'lucide-react';
import { soundEffects } from '../utils/audioFeedback';

export const StudioPage: React.FC = () => {
  const isMicActive = useStudioStore((state) => state.isMicActive);
  const isRecording = useStudioStore((state) => state.isRecording);
  const liveMonitor = useStudioStore((state) => state.liveMonitor);
  const micError = useStudioStore((state) => state.micError);
  const activePresetId = useStudioStore((state) => state.activePresetId);
  const detectedNote = useStudioStore((state) => state.detectedNote);
  const toggleLiveMonitor = useStudioStore((state) => state.toggleLiveMonitor);
  const toggleRecording = useStudioStore((state) => state.toggleRecording);
  const clearMicError = useStudioStore((state) => state.clearMicError);
  const setPreset = useStudioStore((state) => state.setPreset);

  const presets = [
    { id: 'popLead', label: 'Pop Lead Polish', icon: Sparkles, color: 'text-pink-400' },
    { id: 'warmth', label: 'Acoustic Warmth', icon: Flame, color: 'text-amber-400' },
    { id: 'pitchAssist', label: 'Pitch Snap Assist', icon: Wand2, color: 'text-purple-400' },
    { id: 'lofi', label: 'Lo-Fi Vibe', icon: Headphones, color: 'text-cyan-400' },
    { id: 'radio', label: 'Vintage Radio', icon: Radio, color: 'text-emerald-400' },
    { id: 'bypass', label: 'Raw Dry Voice', icon: Sliders, color: 'text-slate-400' },
  ];

  const handleSelectPreset = (id: string) => {
    soundEffects.playPresetChime();
    setPreset(id);
  };

  const handleToggleRecord = () => {
    soundEffects.playClickChime();
    toggleRecording();
  };

  const handleToggleMonitor = () => {
    soundEffects.playClickChime();
    toggleLiveMonitor();
  };

  return (
    <div className="space-y-4 pb-20">
      {/* PWA Home Screen Install Banner */}
      <PWAInstaller />

      {/* Mic Access Error Banner */}
      {micError && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-2xl flex items-center justify-between text-xs text-red-200 animate-fade-in">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{micError}</span>
          </div>
          <button onClick={() => clearMicError()} className="p-1 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Realtime Spectrum & Visualizer Container */}
      <div className="relative w-full h-36 glassmorphism rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center border border-pink-500/20">
        <WaveformCanvas />
        <div className="absolute top-2.5 left-3 text-[10px] uppercase font-bold text-slate-400 tracking-widest flex items-center space-x-1 z-10">
          <span className={`w-1.5 h-1.5 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : isMicActive ? 'bg-emerald-500 animate-pulse' : 'bg-pink-500'}`} />
          <span>Realtime Audio Visualizer</span>
        </div>

        {!isMicActive && (
          <div className="text-slate-500 text-xs font-mono italic z-10">
            Click Record Vocal Take below to start singing
          </div>
        )}

        <div className="absolute bottom-2.5 right-3 text-xs font-mono bg-black/70 px-2.5 py-1 rounded-md text-pink-400 border border-pink-500/30 z-10">
          Detected Pitch: <span className="font-bold text-white">{detectedNote}</span>
        </div>
      </div>

      {/* Preset Voice Modes */}
      <section className="space-y-2">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex justify-between">
          <span>Preset Voice Modes</span>
          <span className="text-pink-400 font-normal">DSP Studio Presets</span>
        </h2>

        <div className="grid grid-cols-3 gap-2">
          {presets.map((p) => {
            const Icon = p.icon;
            const isSelected = activePresetId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p.id)}
                className={`p-3 rounded-xl glass-card text-xs font-semibold flex flex-col items-center gap-1.5 active:scale-95 transition ${
                  isSelected ? 'border-pink-500 text-white bg-pink-500/10' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${p.color}`} />
                <span className="text-[11px] text-center leading-tight">{p.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Recording & Ear Monitor Controls */}
      <section className="space-y-3 pt-2">
        <button
          onClick={handleToggleRecord}
          className={`w-full p-4 rounded-2xl flex items-center justify-center space-x-2 active:scale-95 transition shadow-xl ${
            isRecording
              ? 'bg-red-600 text-white animate-pulse border border-red-400'
              : 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-pink-600/30'
          }`}
        >
          <Disc className="w-6 h-6" />
          <span className="text-sm font-black uppercase tracking-wider">
            {isRecording ? 'Stop Recording' : 'Record Vocal Take'}
          </span>
        </button>

        <div className="flex justify-center">
          <button
            onClick={handleToggleMonitor}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1.5 transition active:scale-95 border ${
              liveMonitor
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>{liveMonitor ? 'Live Ear Monitor (On)' : 'Live Ear Monitor (Off)'}</span>
          </button>
        </div>
      </section>
    </div>
  );
};
