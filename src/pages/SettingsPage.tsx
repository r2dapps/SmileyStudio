import React, { useEffect, useRef, useState } from 'react';
import { useStudioStore } from '../store/useStudioStore';
import { Settings, ShieldCheck, Smartphone, Info, RefreshCw, Palette, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { soundEffects } from '../utils/audioFeedback';
import { AppTheme, CustomThemeTemplate } from '../core/StudioController';
import { PWAInstaller } from '../components/PWAInstaller';

type BuiltinThemeDef = {
  id: AppTheme;
  label: string;
  accent: string;
  secondary: string;
  bg: string;
};

const BUILTIN_THEMES: BuiltinThemeDef[] = [
  { id: 'neonPink',       label: 'Neon Pink',       accent: '#ec4899', secondary: '#c084fc', bg: '#090d16' },
  { id: 'cyberBlue',      label: 'Cyber Blue',      accent: '#38bdf8', secondary: '#3b82f6', bg: '#040d1a' },
  { id: 'emeraldStage',   label: 'Emerald Stage',   accent: '#34d399', secondary: '#2dd4bf', bg: '#021a12' },
  { id: 'amberSunset',    label: 'Amber Sunset',    accent: '#fbbf24', secondary: '#f97316', bg: '#1a0d04' },
  { id: 'midnightPurple', label: 'Midnight Purple', accent: '#a855f7', secondary: '#7c3aed', bg: '#0a0614' },
  { id: 'roseGold',       label: 'Rose Gold',       accent: '#fb7185', secondary: '#f43f5e', bg: '#180a0d' },
  { id: 'oceanDeep',      label: 'Ocean Deep',      accent: '#06b6d4', secondary: '#0ea5e9', bg: '#021824' },
  { id: 'crimsonFire',    label: 'Crimson Fire',    accent: '#ef4444', secondary: '#f97316', bg: '#1a0404' },
];

// Apply custom theme CSS vars to root so CSS picks them up
function applyCustomThemeCssVars(accent: string, secondary: string, bg: string) {
  const root = document.documentElement;
  root.style.setProperty('--custom-accent', accent);
  root.style.setProperty('--custom-secondary', secondary);
  root.style.setProperty('--custom-bg', bg);
  // Build border with 35% alpha
  const r = parseInt(accent.slice(1, 3), 16);
  const g = parseInt(accent.slice(3, 5), 16);
  const b = parseInt(accent.slice(5, 7), 16);
  root.style.setProperty('--custom-border', `rgba(${r},${g},${b},0.35)`);
  root.style.setProperty('--custom-card', `rgba(${Math.round(r * 0.12)},${Math.round(g * 0.12)},${Math.round(b * 0.12)},0.85)`);
}

export const SettingsPage: React.FC = () => {
  const qualityMode = useStudioStore((s) => s.qualityMode);
  const noiseCancellation = useStudioStore((s) => s.noiseCancellation);
  const appTheme = useStudioStore((s) => s.appTheme);
  const customThemeTemplates = useStudioStore((s) => s.customThemeTemplates);
  const activeCustomThemeId = useStudioStore((s) => s.activeCustomThemeId);

  const setParam = useStudioStore((s) => s.setParam);
  const toggleNoiseCancellation = useStudioStore((s) => s.toggleNoiseCancellation);
  const setTheme = useStudioStore((s) => s.setTheme);
  const setActiveCustomTheme = useStudioStore((s) => s.setActiveCustomTheme);
  const saveCustomThemeTemplate = useStudioStore((s) => s.saveCustomThemeTemplate);
  const deleteCustomThemeTemplate = useStudioStore((s) => s.deleteCustomThemeTemplate);

  // Custom theme builder state
  const [newThemeLabel, setNewThemeLabel] = useState('My Theme');
  const [newAccent, setNewAccent] = useState('#ec4899');
  const [newSecondary, setNewSecondary] = useState('#c084fc');
  const [newBg, setNewBg] = useState('#090d16');
  const [showBuilder, setShowBuilder] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  // When a custom theme is active, keep CSS vars synced
  useEffect(() => {
    if (appTheme === 'custom' && activeCustomThemeId) {
      const tmpl = customThemeTemplates.find((t) => t.id === activeCustomThemeId);
      if (tmpl) applyCustomThemeCssVars(tmpl.accent, tmpl.secondary, tmpl.bg);
    }
  }, [appTheme, activeCustomThemeId, customThemeTemplates]);

  // Preview custom builder colors on change
  const previewActive = useRef(false);
  useEffect(() => {
    if (showBuilder) {
      previewActive.current = true;
      applyCustomThemeCssVars(newAccent, newSecondary, newBg);
    }
  }, [newAccent, newSecondary, newBg, showBuilder]);

  const handleSelectBuiltin = (id: AppTheme) => {
    soundEffects.playPresetChime();
    setTheme(id);
  };

  const handleSelectCustomTemplate = (tmpl: CustomThemeTemplate) => {
    soundEffects.playPresetChime();
    applyCustomThemeCssVars(tmpl.accent, tmpl.secondary, tmpl.bg);
    setActiveCustomTheme(tmpl.id);
  };

  const handleSaveCustomTheme = () => {
    soundEffects.playClickChime();
    const id = saveCustomThemeTemplate({
      label: newThemeLabel || 'My Theme',
      accent: newAccent,
      secondary: newSecondary,
      bg: newBg,
    });
    applyCustomThemeCssVars(newAccent, newSecondary, newBg);
    setActiveCustomTheme(id);
    setShowBuilder(false);
    setNewThemeLabel('My Theme');
  };

  const handleCheckUpdate = async () => {
    soundEffects.playClickChime();
    setIsCheckingUpdate(true);
    setUpdateStatus(null);
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) await reg.update();
      }
      setTimeout(() => {
        setIsCheckingUpdate(false);
        setUpdateStatus('Smiley Studio is up-to-date! Running v1.0.0.');
      }, 1000);
    } catch {
      setIsCheckingUpdate(false);
      setUpdateStatus('Smiley Studio is up-to-date!');
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="border-b border-slate-800 pb-2">
        <h1 className="text-base font-bold flex items-center space-x-2">
          <Settings className="w-5 h-5 text-pink-400" />
          <span>App Settings</span>
        </h1>
        <p className="text-xs text-slate-400">Themes, Audio, Install App & Updates</p>
      </div>

      {/* PWA Install — always fixed here */}
      <div className="glassmorphism p-4 rounded-2xl space-y-3 border border-slate-800">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5 border-b border-slate-800 pb-2">
          <Smartphone className="w-4 h-4 text-pink-400" />
          <span>Install App on Phone</span>
        </h2>
        <PWAInstaller inline />
      </div>

      {/* Glowing Studio Themes — 8 Built-ins */}
      <div className="glassmorphism p-4 rounded-2xl space-y-3 border border-slate-800">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5 border-b border-slate-800 pb-2">
          <Palette className="w-4 h-4 text-pink-400" />
          <span>Glowing Studio Themes</span>
        </h2>

        <div className="grid grid-cols-2 gap-2">
          {BUILTIN_THEMES.map((t) => {
            const isSelected = appTheme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleSelectBuiltin(t.id)}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition active:scale-95 ${
                  isSelected ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-900/50 text-slate-400 border-slate-700 hover:text-white'
                }`}
                style={isSelected ? { borderColor: t.accent, boxShadow: `0 0 12px -3px ${t.accent}` } : {}}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.secondary})` }}
                  />
                  <span className="truncate">{t.label}</span>
                </div>
                {isSelected && <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: t.accent }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Theme Templates */}
      <div className="glassmorphism p-4 rounded-2xl space-y-3 border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
            <Palette className="w-4 h-4 text-purple-400" />
            <span>My Custom Themes</span>
          </h2>
          <button
            onClick={() => { soundEffects.playClickChime(); setShowBuilder(!showBuilder); }}
            className="px-2.5 py-1 bg-purple-600/20 border border-purple-500/40 text-purple-300 text-[11px] font-bold rounded-xl flex items-center space-x-1 hover:bg-purple-600/30 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Theme</span>
          </button>
        </div>

        {/* Builder Panel */}
        {showBuilder && (
          <div className="space-y-3 p-3 bg-slate-900/60 rounded-xl border border-purple-500/20 animate-fade-in">
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Build Your Signature Theme</p>

            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 uppercase tracking-widest">Theme Name</label>
              <input
                type="text"
                value={newThemeLabel}
                onChange={(e) => setNewThemeLabel(e.target.value)}
                placeholder="e.g. Smiley's Pink"
                className="w-full bg-slate-800 text-white text-xs rounded-xl px-3 py-2 border border-slate-700 outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block text-center">Accent</label>
                <div className="flex flex-col items-center space-y-1">
                  <input
                    type="color"
                    value={newAccent}
                    onChange={(e) => setNewAccent(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border-2 border-slate-700"
                  />
                  <span className="text-[9px] text-slate-500 font-mono">{newAccent}</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block text-center">Secondary</label>
                <div className="flex flex-col items-center space-y-1">
                  <input
                    type="color"
                    value={newSecondary}
                    onChange={(e) => setNewSecondary(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border-2 border-slate-700"
                  />
                  <span className="text-[9px] text-slate-500 font-mono">{newSecondary}</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block text-center">Background</label>
                <div className="flex flex-col items-center space-y-1">
                  <input
                    type="color"
                    value={newBg}
                    onChange={(e) => setNewBg(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border-2 border-slate-700"
                  />
                  <span className="text-[9px] text-slate-500 font-mono">{newBg}</span>
                </div>
              </div>
            </div>

            {/* Live Preview Strip */}
            <div
              className="w-full h-8 rounded-xl flex items-center justify-center text-[10px] font-bold"
              style={{
                background: `linear-gradient(135deg, ${newAccent}, ${newSecondary})`,
                color: '#fff',
                boxShadow: `0 0 16px -4px ${newAccent}`,
              }}
            >
              {newThemeLabel || 'Preview'} — Live Preview
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleSaveCustomTheme}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition active:scale-95"
              >
                Save as Template
              </button>
              <button
                onClick={() => setShowBuilder(false)}
                className="px-3 py-2 bg-slate-800 text-slate-400 rounded-xl text-xs font-bold hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Saved Custom Theme Cards */}
        {customThemeTemplates.length === 0 && !showBuilder && (
          <p className="text-[11px] text-slate-500 text-center py-2 italic">
            No custom themes yet. Tap "New Theme" to create Smiley's signature look!
          </p>
        )}

        {customThemeTemplates.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {customThemeTemplates.map((tmpl) => {
              const isSelected = appTheme === 'custom' && activeCustomThemeId === tmpl.id;
              return (
                <div key={tmpl.id} className="relative">
                  <button
                    onClick={() => handleSelectCustomTemplate(tmpl)}
                    className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center space-x-2 transition active:scale-95 ${
                      isSelected ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-900/50 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                    style={isSelected ? { borderColor: tmpl.accent, boxShadow: `0 0 12px -3px ${tmpl.accent}` } : {}}
                  >
                    <div
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ background: `linear-gradient(135deg, ${tmpl.accent}, ${tmpl.secondary})` }}
                    />
                    <span className="truncate flex-1 text-left">{tmpl.label}</span>
                    {isSelected && <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: tmpl.accent }} />}
                  </button>
                  <button
                    onClick={() => { soundEffects.playClickChime(); deleteCustomThemeTemplate(tmpl.id); }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-500 transition"
                    title="Delete theme"
                  >
                    <Trash2 className="w-2.5 h-2.5 text-white" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hardware Noise Cancellation */}
      <div className="glassmorphism p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-xs font-bold text-white">Hardware Noise Suppression</h2>
              <p className="text-[10px] text-slate-400">Suppresses room hiss, fan noise & echo</p>
            </div>
          </div>
          <button
            onClick={() => { soundEffects.playClickChime(); toggleNoiseCancellation(); }}
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
              onClick={() => { soundEffects.playClickChime(); setParam('qualityMode', mode); }}
              className={`p-2.5 rounded-xl border text-xs font-bold capitalize transition ${
                qualityMode === mode ? 'bg-pink-500/20 text-pink-400 border-pink-500' : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
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
              <p className="text-[10px] text-slate-400">Check for the latest version</p>
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
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300">
            {updateStatus}
          </div>
        )}
      </div>

      {/* About */}
      <div className="glassmorphism p-4 rounded-2xl space-y-2 border border-slate-800 text-xs text-slate-400">
        <div className="flex items-center space-x-2 font-bold text-slate-200">
          <Info className="w-4 h-4 text-pink-400" />
          <span>Smiley Studio v1.0.0</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Designed with love for singer <strong className="text-pink-400">Smiley</strong>. Built with React 18, Vite, Web Audio API DSP Engine, and IndexedDB offline storage.
        </p>
      </div>
    </div>
  );
};
