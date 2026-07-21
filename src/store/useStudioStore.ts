import { create } from 'zustand';
import { studioController, StudioState, AppTheme, CustomThemeTemplate } from '../core/StudioController';

interface StudioStore extends StudioState {
  toggleLiveMonitor: () => Promise<void>;
  toggleNoiseCancellation: () => Promise<void>;
  toggleRecording: () => Promise<void>;
  clearMicError: () => void;
  saveCustomPreset: (label: string) => void;
  deleteCustomPreset: (id: string) => void;
  setTheme: (theme: AppTheme) => void;
  setActiveCustomTheme: (id: string) => void;
  saveCustomThemeTemplate: (template: Omit<CustomThemeTemplate, 'id'>) => string;
  deleteCustomThemeTemplate: (id: string) => void;
  setPreset: (presetId: string) => void;
  setParam: (key: keyof StudioState, value: any) => void;
  setBackingTrack: (name: string | null) => void;
}

export const useStudioStore = create<StudioStore>((set) => {
  studioController.subscribe((newState) => {
    set(newState);
  });

  return {
    ...studioController.getState(),

    toggleLiveMonitor: async () => { await studioController.toggleLiveMonitor(); },
    toggleNoiseCancellation: async () => { await studioController.toggleNoiseCancellation(); },
    toggleRecording: async () => { await studioController.toggleRecording(); },
    clearMicError: () => { studioController.clearMicError(); },
    saveCustomPreset: (label: string) => { studioController.saveCustomPreset(label); },
    deleteCustomPreset: (id: string) => { studioController.deleteCustomPreset(id); },
    setTheme: (theme: AppTheme) => { studioController.setTheme(theme); },
    setActiveCustomTheme: (id: string) => { studioController.setActiveCustomTheme(id); },
    saveCustomThemeTemplate: (template) => studioController.saveCustomThemeTemplate(template),
    deleteCustomThemeTemplate: (id: string) => { studioController.deleteCustomThemeTemplate(id); },
    setPreset: (presetId: string) => { studioController.setPreset(presetId); },
    setParam: (key: keyof StudioState, value: any) => { studioController.setParam(key, value); },
    setBackingTrack: (name: string | null) => { studioController.setBackingTrack(name); },
  };
});
