import { create } from 'zustand';
import { studioController, StudioState } from '../core/StudioController';

interface StudioStore extends StudioState {
  toggleMic: () => Promise<void>;
  toggleRecording: () => void;
  setPreset: (presetId: string) => void;
  setParam: (key: keyof StudioState, value: any) => void;
  setBackingTrack: (name: string | null) => void;
}

export const useStudioStore = create<StudioStore>((set) => {
  // Subscribe Zustand store to StudioController updates
  studioController.subscribe((newState) => {
    set(newState);
  });

  return {
    ...studioController.getState(),

    toggleMic: async () => {
      await studioController.toggleMic();
    },

    toggleRecording: () => {
      studioController.toggleRecording();
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
