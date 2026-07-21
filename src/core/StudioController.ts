import { detectCapabilities, Capabilities } from '../utils/capabilities';
import { audioEngine } from '../audio/engine';
import { AudioRecorder } from '../audio/recorder/Recorder';
import { RecordingsRepository } from '../db/recordings';
import { autoCorrelatePitch } from '../audio/pitch/detector';
import { getPitchDetails } from '../audio/pitch/tuner';

export type CustomPreset = {
  id: string;
  label: string;
  isCustom: boolean;
  params: {
    micGain: number;
    noiseGateThreshold: number;
    tubeSaturation: number;
    chorusDepth: number;
    echoDelayTime: number;
    echoFeedback: number;
    reverbWet: number;
  };
};

export type AppTheme = 'neonPink' | 'cyberBlue' | 'emeraldStage' | 'amberSunset';

export type StudioState = {
  isMicActive: boolean;
  isRecording: boolean;
  liveMonitor: boolean;
  noiseCancellation: boolean;
  micError: string | null;
  activePresetId: string;
  customPresets: CustomPreset[];
  appTheme: AppTheme;
  detectedPitchHz: number;
  detectedNote: string;
  detectedCents: number;
  backingTrackName: string | null;
  masterVolume: number;
  micGain: number;
  noiseGateThreshold: number;
  echoDelayTime: number;
  echoFeedback: number;
  reverbWet: number;
  chorusDepth: number;
  tubeSaturation: number;
  qualityMode: 'performance' | 'balanced' | 'studio';
  recordingsCount: number;
};

export type StudioStateListener = (state: StudioState) => void;

export class StudioController {
  private static instance: StudioController;
  public readonly capabilities: Capabilities;
  private recorder: AudioRecorder = new AudioRecorder();
  private recordingStartTime: number = 0;
  private pitchTimerId: any = null;
  
  private state: StudioState = {
    isMicActive: false,
    isRecording: false,
    liveMonitor: false,
    noiseCancellation: true,
    micError: null,
    activePresetId: 'popLead',
    customPresets: [],
    appTheme: 'neonPink',
    detectedPitchHz: 0,
    detectedNote: '--',
    detectedCents: 0,
    backingTrackName: null,
    masterVolume: 1.0,
    micGain: 1.0,
    noiseGateThreshold: 0.01,
    echoDelayTime: 0.25,
    echoFeedback: 0.4,
    reverbWet: 0.35,
    chorusDepth: 0.4,
    tubeSaturation: 15,
    qualityMode: 'balanced',
    recordingsCount: 0,
  };

  private listeners: Set<StudioStateListener> = new Set();

  private constructor() {
    this.capabilities = detectCapabilities();
    this.loadCustomPresetsFromStorage();
    this.loadThemeFromStorage();
  }

  public static getInstance(): StudioController {
    if (!StudioController.instance) {
      StudioController.instance = new StudioController();
    }
    return StudioController.instance;
  }

  private loadCustomPresetsFromStorage() {
    try {
      const saved = localStorage.getItem('smiley_custom_presets');
      if (saved) {
        this.state.customPresets = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load custom presets:', e);
    }
  }

  private loadThemeFromStorage() {
    try {
      const savedTheme = localStorage.getItem('smiley_app_theme') as AppTheme;
      if (savedTheme) {
        this.state.appTheme = savedTheme;
      }
    } catch (e) {}
  }

  public setTheme(theme: AppTheme) {
    this.state.appTheme = theme;
    try {
      localStorage.setItem('smiley_app_theme', theme);
    } catch (e) {}
    this.notify();
  }

  private saveCustomPresetsToStorage() {
    try {
      localStorage.setItem('smiley_custom_presets', JSON.stringify(this.state.customPresets));
    } catch (e) {
      console.warn('Failed to save custom presets:', e);
    }
  }

  public getState(): StudioState {
    return { ...this.state };
  }

  public subscribe(listener: StudioStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const currentState = this.getState();
    this.listeners.forEach((listener) => listener(currentState));
  }

  public clearMicError() {
    this.state.micError = null;
    this.notify();
  }

  public saveCustomPreset(label: string): void {
    const id = `custom_${Date.now()}`;
    const newPreset: CustomPreset = {
      id,
      label,
      isCustom: true,
      params: {
        micGain: this.state.micGain,
        noiseGateThreshold: this.state.noiseGateThreshold,
        tubeSaturation: this.state.tubeSaturation,
        chorusDepth: this.state.chorusDepth,
        echoDelayTime: this.state.echoDelayTime,
        echoFeedback: this.state.echoFeedback,
        reverbWet: this.state.reverbWet,
      },
    };

    this.state.customPresets.push(newPreset);
    this.state.activePresetId = id;
    this.saveCustomPresetsToStorage();
    this.notify();
  }

  public deleteCustomPreset(id: string): void {
    this.state.customPresets = this.state.customPresets.filter((p) => p.id !== id);
    if (this.state.activePresetId === id) {
      this.setPreset('popLead');
    } else {
      this.saveCustomPresetsToStorage();
      this.notify();
    }
  }

  // --- Controller Command Interface ---

  public async toggleLiveMonitor(): Promise<boolean> {
    this.state.liveMonitor = !this.state.liveMonitor;
    if (this.state.liveMonitor) {
      await this.startMicEngine();
    } else if (!this.state.isRecording) {
      this.stopMicEngine();
    }
    this.notify();
    return this.state.liveMonitor;
  }

  public async toggleNoiseCancellation(): Promise<boolean> {
    this.state.noiseCancellation = !this.state.noiseCancellation;
    if (this.state.isMicActive) {
      await audioEngine.start({ noiseCancellation: this.state.noiseCancellation });
    }
    this.notify();
    return this.state.noiseCancellation;
  }

  private async startMicEngine(): Promise<boolean> {
    if (this.state.isMicActive) return true;
    this.state.micError = null;
    try {
      await audioEngine.start({ noiseCancellation: this.state.noiseCancellation });
      this.state.isMicActive = true;
      this.applyParamsToAudioGraph();
      this.startPitchDetectionLoop();
      return true;
    } catch (err: any) {
      console.error('Microphone start failed:', err);
      this.state.isMicActive = false;
      this.state.micError = err?.message || 'Microphone access denied. Please grant microphone permission in browser settings.';
      this.notify();
      return false;
    }
  }

  private stopMicEngine(): void {
    this.stopPitchDetectionLoop();
    audioEngine.stop();
    this.state.isMicActive = false;
  }

  public async toggleRecording(): Promise<boolean> {
    if (!this.state.isRecording) {
      const started = await this.startMicEngine();
      if (!started) return false;

      const graph = audioEngine.getGraph();
      if (graph) {
        const audioCtx = graph.outputNode.context as AudioContext;
        const dest = audioCtx.createMediaStreamDestination();
        graph.outputNode.connect(dest);
        this.recorder.startRecording(dest.stream);
      }
      this.recordingStartTime = Date.now();
      this.state.isRecording = true;
    } else {
      await this.stopRecording();
    }
    this.notify();
    return this.state.isRecording;
  }

  public async stopRecording(): Promise<void> {
    if (!this.state.isRecording) return;
    try {
      const blob = await this.recorder.stopRecording();
      const duration = Math.round((Date.now() - this.recordingStartTime) / 1000);
      const title = `Smiley Take ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      
      const blobId = `blob_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      await RecordingsRepository.saveRecording(
        {
          title,
          createdAt: new Date().toISOString(),
          duration,
          sampleRate: 44100,
          appVersion: '1.0.0',
          presetVersion: '1.0',
          presetName: this.state.activePresetId,
          format: 'webm',
          favorite: false,
          notes: '',
          blobId,
        },
        blob
      );
      this.state.recordingsCount += 1;
    } catch (e) {
      console.error('Failed to stop/save recording:', e);
    } finally {
      this.state.isRecording = false;
      if (!this.state.liveMonitor) {
        this.stopMicEngine();
      }
      this.notify();
    }
  }

  private startPitchDetectionLoop() {
    this.stopPitchDetectionLoop();
    this.pitchTimerId = setInterval(() => {
      const analyser = audioEngine.getAnalyser();
      if (!analyser || !this.state.isMicActive) return;

      const buffer = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(buffer);

      const ctx = analyser.context;
      const hz = autoCorrelatePitch(buffer, ctx.sampleRate);
      if (hz > 0) {
        const details = getPitchDetails(hz);
        this.state.detectedPitchHz = details.frequency;
        this.state.detectedNote = details.note;
        this.state.detectedCents = details.cents;
      } else {
        this.state.detectedPitchHz = 0;
        this.state.detectedNote = '--';
        this.state.detectedCents = 0;
      }
      this.notify();
    }, 50);
  }

  private stopPitchDetectionLoop() {
    if (this.pitchTimerId) {
      clearInterval(this.pitchTimerId);
      this.pitchTimerId = null;
    }
    this.state.detectedPitchHz = 0;
    this.state.detectedNote = '--';
    this.state.detectedCents = 0;
  }

  public setPreset(presetId: string) {
    this.state.activePresetId = presetId;

    const custom = this.state.customPresets.find((p) => p.id === presetId);
    if (custom) {
      this.state.micGain = custom.params.micGain;
      this.state.noiseGateThreshold = custom.params.noiseGateThreshold;
      this.state.tubeSaturation = custom.params.tubeSaturation;
      this.state.chorusDepth = custom.params.chorusDepth;
      this.state.echoDelayTime = custom.params.echoDelayTime;
      this.state.echoFeedback = custom.params.echoFeedback;
      this.state.reverbWet = custom.params.reverbWet;
    } else if (presetId === 'popLead') {
      this.state.micGain = 1.0;
      this.state.noiseGateThreshold = 0.01;
      this.state.tubeSaturation = 15;
      this.state.chorusDepth = 0.4;
      this.state.echoDelayTime = 0.25;
      this.state.echoFeedback = 0.35;
      this.state.reverbWet = 0.35;
    } else if (presetId === 'warmth') {
      this.state.micGain = 1.1;
      this.state.noiseGateThreshold = 0.008;
      this.state.tubeSaturation = 25;
      this.state.chorusDepth = 0.2;
      this.state.echoDelayTime = 0.15;
      this.state.echoFeedback = 0.2;
      this.state.reverbWet = 0.45;
    } else if (presetId === 'pitchAssist') {
      this.state.micGain = 1.0;
      this.state.noiseGateThreshold = 0.012;
      this.state.tubeSaturation = 10;
      this.state.chorusDepth = 0.5;
      this.state.echoDelayTime = 0.3;
      this.state.echoFeedback = 0.4;
      this.state.reverbWet = 0.3;
    } else if (presetId === 'lofi') {
      this.state.micGain = 0.9;
      this.state.noiseGateThreshold = 0.02;
      this.state.tubeSaturation = 40;
      this.state.chorusDepth = 0.6;
      this.state.echoDelayTime = 0.4;
      this.state.echoFeedback = 0.5;
      this.state.reverbWet = 0.6;
    } else if (presetId === 'radio') {
      this.state.micGain = 1.2;
      this.state.noiseGateThreshold = 0.025;
      this.state.tubeSaturation = 35;
      this.state.chorusDepth = 0.0;
      this.state.echoDelayTime = 0.1;
      this.state.echoFeedback = 0.1;
      this.state.reverbWet = 0.1;
    } else if (presetId === 'bypass') {
      this.state.micGain = 1.0;
      this.state.noiseGateThreshold = 0.005;
      this.state.tubeSaturation = 0;
      this.state.chorusDepth = 0.0;
      this.state.echoDelayTime = 0.05;
      this.state.echoFeedback = 0.0;
      this.state.reverbWet = 0.0;
    }

    this.applyPresetToAudioGraph(presetId);
    this.applyParamsToAudioGraph();
    this.notify();
  }

  public setParam(key: keyof StudioState, value: any) {
    if (key in this.state) {
      (this.state as any)[key] = value;
      this.applyParamsToAudioGraph();
      this.notify();
    }
  }

  public setBackingTrack(name: string | null) {
    this.state.backingTrackName = name;
    this.notify();
  }

  private applyPresetToAudioGraph(presetId: string) {
    const graph = audioEngine.getGraph();
    if (!graph) return;

    if (presetId === 'popLead') {
      graph.eq.update({ type: 'highpass', frequency: 120 });
    } else if (presetId === 'warmth') {
      graph.eq.update({ type: 'peaking', frequency: 250, gain: 4 });
    } else if (presetId === 'lofi') {
      graph.eq.update({ type: 'bandpass', frequency: 1500 });
    } else if (presetId === 'radio') {
      graph.eq.update({ type: 'bandpass', frequency: 2000 });
    } else if (presetId === 'bypass') {
      graph.eq.update({ type: 'allpass' });
    }
  }

  private applyParamsToAudioGraph() {
    const graph = audioEngine.getGraph();
    if (!graph) return;

    graph.setMicGain(this.state.micGain);
    graph.gate.update({ threshold: this.state.noiseGateThreshold });
    graph.saturation.update({ amount: this.state.tubeSaturation });
    graph.chorus.update({ depth: this.state.chorusDepth });
    graph.delay.update({ time: this.state.echoDelayTime, feedback: this.state.echoFeedback });
    graph.reverb.update({ wet: this.state.reverbWet });
  }
}

export const studioController = StudioController.getInstance();
