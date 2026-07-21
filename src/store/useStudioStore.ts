import { create } from 'zustand';
import { studioController, StudioState, AppTheme } from '../core/StudioController';

interface StudioStore extends StudioState {
  toggleLiveMonitor: () => Promise<void>;
  toggleNoiseCancellation: () => Promise<void>;
  toggleRecording: () => Promise<void>;
  clearMicError: () => void;
  saveCustomPreset: (label: string) => void;
  deleteCustomPreset: (id: string) => void;
  setTheme: (theme: AppTheme) => void;
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

    toggleLiveMonitor: async () => {
      await studioController.toggleLiveMonitor();
    },

    toggleNoiseCancellation: async () => {
      await studioController.toggleNoiseCancellation();
    },

    toggleRecording: async () => {
      await studioController.toggleRecording();
    },

    clearMicError: () => {
      studioController.clearMicError();
    },

    saveCustomPreset: (label: string) => {
      studioController.saveCustomPreset(label);
    },

    deleteCustomPreset: (id: string) => {
      studioController.deleteCustomPreset(id);
    },

    setTheme: (theme: AppTheme) => {
      studioController.setTheme(theme);
    },

    setPreset: (presetId: string) => {
      studioController.setPreset(presetId);
    },

    setParam: (key: keyof StudioState, value: any) => {
      studioController.setParam(key, value);
    },

    setBackingTrack: (name: string | null) => {
      studioController.setBackingTrack(name);
    },
  };
});
