import React from 'react';
import { useStudioStore } from '../store/useStudioStore';

export const FXRackPage: React.FC = () => {
  const state = useStudioStore();
  const setParam = useStudioStore((s) => s.setParam);

  return (
    <div className="space-y-4 pb-20">
      <div className="border-b border-slate-800 pb-2">
        <h1 className="text-base font-bold">Pro Vocal FX Rack</h1>
        <p className="text-xs text-slate-400">Master DSP Vocal Processing Chain Sliders</p>
      </div>

      <div className="glassmorphism p-4 rounded-2xl space-y-4 border border-slate-800">
        <div>
          <div className="flex justify-between text-xs mb-1.5 font-medium">
            <span className="text-slate-300">Microphone Volume Boost</span>
            <span className="text-pink-400 font-mono">{Math.round(state.micGain * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="2.5"
            step="0.05"
            value={state.micGain}
            onChange={(e) => setParam('micGain', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5 font-medium">
            <span className="text-slate-300">Background Noise Gate Threshold</span>
            <span className="text-pink-400 font-mono">{state.noiseGateThreshold === 0 ? 'Off' : state.noiseGateThreshold}</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.05"
            step="0.002"
            value={state.noiseGateThreshold}
            onChange={(e) => setParam('noiseGateThreshold', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5 font-medium">
            <span className="text-slate-300">Tube Saturation Warmth</span>
            <span className="text-pink-400 font-mono">{state.tubeSaturation}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={state.tubeSaturation}
            onChange={(e) => setParam('tubeSaturation', parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5 font-medium">
            <span className="text-slate-300">Stereo Chorus / Harmony Depth</span>
            <span className="text-pink-400 font-mono">{Math.round(state.chorusDepth * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1.0"
            step="0.05"
            value={state.chorusDepth}
            onChange={(e) => setParam('chorusDepth', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5 font-medium">
            <span className="text-slate-300">Echo Delay Time</span>
            <span className="text-pink-400 font-mono">{state.echoDelayTime}s</span>
          </div>
          <input
            type="range"
            min="0"
            max="1.0"
            step="0.02"
            value={state.echoDelayTime}
            onChange={(e) => setParam('echoDelayTime', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5 font-medium">
            <span className="text-slate-300">Echo Feedback Tail</span>
            <span className="text-pink-400 font-mono">{Math.round(state.echoFeedback * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.85"
            step="0.05"
            value={state.echoFeedback}
            onChange={(e) => setParam('echoFeedback', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5 font-medium">
            <span className="text-slate-300">Concert Reverb Wet</span>
            <span className="text-pink-400 font-mono">{Math.round(state.reverbWet * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1.0"
            step="0.05"
            value={state.reverbWet}
            onChange={(e) => setParam('reverbWet', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
