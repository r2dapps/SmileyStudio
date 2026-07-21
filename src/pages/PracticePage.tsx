import React, { useState, useEffect } from 'react';
import { useStudioStore } from '../store/useStudioStore';
import { PitchMeterCanvas } from '../components/visualizers/PitchMeterCanvas';
import { Activity, Play, Pause, Volume2, Music2 } from 'lucide-react';

export const PracticePage: React.FC = () => {
  const isMicActive = useStudioStore((state) => state.isMicActive);
  const detectedNote = useStudioStore((state) => state.detectedNote);
  const detectedCents = useStudioStore((state) => state.detectedCents);
  const detectedPitchHz = useStudioStore((state) => state.detectedPitchHz);

  // Metronome State
  const [bpm, setBpm] = useState<number>(120);
  const [isPlayingMetronome, setIsPlayingMetronome] = useState<boolean>(false);

  useEffect(() => {
    let timerId: any;
    if (isPlayingMetronome) {
      const intervalMs = (60 / bpm) * 1000;
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

      timerId = setInterval(() => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.value = 1000; // Click pitch
        gain.gain.value = 0.3;
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      }, intervalMs);
    }
    return () => clearInterval(timerId);
  }, [isPlayingMetronome, bpm]);

  return (
    <div className="space-y-4 pb-20">
      <div className="border-b border-slate-800 pb-2">
        <h1 className="text-base font-bold">Vocal Practice & Tuner Suite</h1>
        <p className="text-xs text-slate-400">Chromatic Pitch Tuner Gauge & Studio Metronome</p>
      </div>

      {/* Chromatic Pitch Tuner */}
      <div className="glassmorphism p-4 rounded-2xl space-y-3 border border-slate-800 text-center">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">
          <span className="flex items-center space-x-1.5">
            <Activity className="w-4 h-4 text-pink-400" />
            <span>Chromatic Pitch Tuner</span>
          </span>
          <span className="text-[10px] text-pink-400 font-mono">
            {detectedPitchHz > 0 ? `${detectedPitchHz} Hz` : '-- Hz'}
          </span>
        </div>

        <PitchMeterCanvas note={detectedNote} cents={detectedCents} />

        <div className="space-y-1">
          <div className="text-2xl font-black text-white font-mono tracking-widest">{detectedNote}</div>
          <p className="text-xs text-slate-400">
            {detectedCents === 0
              ? 'In Tune'
              : detectedCents > 0
              ? `+${detectedCents} cents (Sharp)`
              : `${detectedCents} cents (Flat)`}
          </p>
        </div>
      </div>

      {/* Studio Metronome */}
      <div className="glassmorphism p-4 rounded-2xl space-y-3 border border-slate-800">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">
          <span className="flex items-center space-x-1.5">
            <Music2 className="w-4 h-4 text-pink-400" />
            <span>Studio Metronome</span>
          </span>
          <span className="text-xs font-bold text-pink-400 font-mono">{bpm} BPM</span>
        </div>

        <div>
          <input
            type="range"
            min="40"
            max="240"
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <button
          onClick={() => setIsPlayingMetronome(!isPlayingMetronome)}
          className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition active:scale-95 border ${
            isPlayingMetronome
              ? 'bg-red-600 border-red-500 text-white animate-pulse'
              : 'bg-pink-600 border-pink-500 text-white shadow-lg shadow-pink-600/30'
          }`}
        >
          {isPlayingMetronome ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
          <span>{isPlayingMetronome ? 'Stop Metronome' : 'Start Metronome'}</span>
        </button>
      </div>
    </div>
  );
};
