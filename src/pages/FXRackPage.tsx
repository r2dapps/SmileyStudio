import React from 'react';
import { useStudioStore } from '../store/useStudioStore';
import { Sliders, Shield, Flame, Waves, Repeat, Radio, Mic, Wand2, Headphones } from 'lucide-react';
import { soundEffects } from '../utils/audioFeedback';

export const FXRackPage: React.FC = () => {
  const activePresetId = useStudioStore((state) => state.activePresetId);
  const micGain = useStudioStore((state) => state.micGain);
  const noiseGateThreshold = useStudioStore((state) => state.noiseGateThreshold);
  const tubeSaturation = useStudioStore((state) => state.tubeSaturation);
  const chorusDepth = useStudioStore((state) => state.chorusDepth);
  const echoDelayTime = useStudioStore((state) => state.echoDelayTime);
  const echoFeedback = useStudioStore((state) => state.echoFeedback);
  const reverbWet = useStudioStore((state) => state.reverbWet);

  const setParam = useStudioStore((state) => state.setParam);
  const setPreset = useStudioStore((state) => state.setPreset);

  const presets = [
    { id: 'popLead', label: 'Pop Lead', icon: Mic, color: 'text-pink-400' },
    { id: 'warmth', label: 'Acoustic Warmth', icon: Flame, color: 'text-amber-400' },
    { id: 'pitchAssist', label: 'Pitch Snap', icon: Wand2, color: 'text-purple-400' },
    { id: 'lofi', label: 'Lo-Fi Vibe', icon: Headphones, color: 'text-cyan-400' },
    { id: 'radio', label: 'Vintage Radio', icon: Radio, color: 'text-emerald-400' },
    { id: 'bypass', label: 'Raw Dry', icon: Sliders, color: 'text-slate-400' },
  ];

  const handleSelectPreset = (presetId: string) => {
    soundEffects.playPresetChime();
    setPreset(presetId);
  };

  const handleSliderChange = (key: any, val: number) => {
    soundEffects.playClickChime();
    setParam(key, val);
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="border-b border-slate-800 pb-2">
        <h1 className="text-base font-bold flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-pink-400" />
          <span>Vocal FX Processing Rack</span>
        </h1>
        <p className="text-xs text-slate-400">Select a Preset Template or Adjust Custom DSP Controls</p>
      </div>

      {/* Predefined Preset Template Cards */}
      <section className="space-y-2">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex justify-between">
          <span>Vocal Preset Templates</span>
          <span className="text-pink-400 font-normal">Auto-Sync Sliders</span>
        </h2>

        <div className="grid grid-cols-3 gap-2">
          {presets.map((p) => {
            const Icon = p.icon;
            const isSelected = activePresetId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p.id)}
                className={`p-2.5 rounded-xl glass-card text-xs font-semibold flex flex-col items-center gap-1 transition active:scale-95 ${
                  isSelected ? 'border-pink-500 text-white bg-pink-500/10 shadow-lg shadow-pink-500/10' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${p.color}`} />
                <span className="text-[11px] text-center leading-tight">{p.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Sliders Grid */}
      <div className="glassmorphism p-4 rounded-2xl space-y-4 border border-slate-800">
        {/* Mic Input Boost */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-300 flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-pink-400" />
              <span>Mic Gain Boost</span>
            </span>
            <span className="text-pink-400 font-mono">{(micGain * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="0.05"
            value={micGain}
            onChange={(e) => handleSliderChange('micGain', parseFloat(e.target.value))}
            className="w-full accent-pink-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />
        </div>

        {/* Noise Gate */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-300 flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>Noise Gate Threshold</span>
            </span>
            <span className="text-indigo-400 font-mono">{(noiseGateThreshold * 1000).toFixed(0)} mV</span>
          </div>
          <input
            type="range"
            min="0.001"
            max="0.05"
            step="0.001"
            value={noiseGateThreshold}
            onChange={(e) => handleSliderChange('noiseGateThreshold', parseFloat(e.target.value))}
            className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />
        </div>

        {/* Tube Saturation Warmth */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-300 flex items-center space-x-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Tube Saturation Warmth</span>
            </span>
            <span className="text-amber-400 font-mono">{tubeSaturation}</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={tubeSaturation}
            onChange={(e) => handleSliderChange('tubeSaturation', parseInt(e.target.value))}
            className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />
        </div>

        {/* Stereo Chorus Doubler */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-300 flex items-center space-x-1.5">
              <Waves className="w-3.5 h-3.5 text-cyan-400" />
              <span>Stereo Chorus Depth</span>
            </span>
            <span className="text-cyan-400 font-mono">{(chorusDepth * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={chorusDepth}
            onChange={(e) => handleSliderChange('chorusDepth', parseFloat(e.target.value))}
            className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />
        </div>

        {/* Echo Delay Time */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-300 flex items-center space-x-1.5">
              <Repeat className="w-3.5 h-3.5 text-emerald-400" />
              <span>Echo Delay Time</span>
            </span>
            <span className="text-emerald-400 font-mono">{(echoDelayTime * 1000).toFixed(0)} ms</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="1.0"
            step="0.05"
            value={echoDelayTime}
            onChange={(e) => handleSliderChange('echoDelayTime', parseFloat(e.target.value))}
            className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />
        </div>

        {/* Delay Feedback */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-300 flex items-center space-x-1.5">
              <Repeat className="w-3.5 h-3.5 text-teal-400" />
              <span>Delay Echo Repeats</span>
            </span>
            <span className="text-teal-400 font-mono">{(echoFeedback * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.85"
            step="0.05"
            value={echoFeedback}
            onChange={(e) => handleSliderChange('echoFeedback', parseFloat(e.target.value))}
            className="w-full accent-teal-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />
        </div>

        {/* Concert Reverb */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-300 flex items-center space-x-1.5">
              <Radio className="w-3.5 h-3.5 text-purple-400" />
              <span>Concert Reverb Wet</span>
            </span>
            <span className="text-purple-400 font-mono">{(reverbWet * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1.0"
            step="0.05"
            value={reverbWet}
            onChange={(e) => handleSliderChange('reverbWet', parseFloat(e.target.value))}
            className="w-full accent-purple-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
