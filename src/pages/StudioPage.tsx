import React from 'react';
import { useStudioStore } from '../store/useStudioStore';
import { WaveformCanvas } from '../components/visualizers/WaveformCanvas';
import { Mic, Disc, Sparkles, Sliders, Radio, Headphones, Wand2, Flame } from 'lucide-react';

export const StudioPage: React.FC = () => {
  const isMicActive = useStudioStore((state) => state.isMicActive);
  const isRecording = useStudioStore((state) => state.isRecording);
  const activePresetId = useStudioStore((state) => state.activePresetId);
  const detectedNote = useStudioStore((state) => state.detectedNote);
  const toggleMic = useStudioStore((state) => state.toggleMic);
  const toggleRecording = useStudioStore((state) => state.toggleRecording);
  const setPreset = useStudioStore((state) => state.setPreset);

  const presets = [
    { id: 'popLead', label: 'Pop Lead Polish', icon: Sparkles, color: 'text-pink-400' },
    { id: 'warmth', label: 'Acoustic Warmth', icon: Flame, color: 'text-amber-400' },
    { id: 'pitchAssist', label: 'Pitch Snap Assist', icon: Wand2, color: 'text-purple-400' },
    { id: 'lofi', label: 'Lo-Fi Vibe', icon: Headphones, color: 'text-cyan-400' },
    { id: 'radio', label: 'Vintage Radio', icon: Radio, color: 'text-emerald-400' },
    { id: 'bypass', label: 'Raw Dry Voice', icon: Sliders, color: 'text-slate-400' },
  ];

  return (
    <div className="space-y-4 pb-20">
      {/* Realtime Spectrum & Visualizer Container */}
      <div className="relative w-full h-36 glassmorphism rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center border border-pink-500/20">
        <WaveformCanvas />
        <div className="absolute top-2.5 left-3 text-[10px] uppercase font-bold text-slate-400 tracking-widest flex items-center space-x-1 z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" />
          <span>Realtime Audio Visualizer</span>
        </div>

        {!isMicActive && (
          <div className="text-slate-500 text-xs font-mono italic z-10">
            Microphone is currently idle
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
                onClick={() => setPreset(p.id)}
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

      {/* Main Mic & Record Controls */}
      <section className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={() => toggleMic()}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 active:scale-95 transition shadow-lg border ${
            isMicActive
              ? 'bg-emerald-600 border-emerald-500 text-white'
              : 'bg-slate-800 border-slate-700 text-slate-300'
          }`}
        >
          <Mic className="w-6 h-6" />
          <span className="text-xs font-bold">{isMicActive ? 'Mic Active' : 'Start Mic'}</span>
        </button>

        <button
          onClick={() => toggleRecording()}
          disabled={!isMicActive}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 active:scale-95 transition shadow-lg ${
            isRecording
              ? 'bg-red-600 text-white animate-pulse'
              : 'bg-pink-600 disabled:opacity-40 text-white shadow-pink-600/30'
          }`}
        >
          <Disc className="w-6 h-6" />
          <span className="text-xs font-bold">{isRecording ? 'Stop Recording' : 'Record Take'}</span>
        </button>
      </section>
    </div>
  );
};
