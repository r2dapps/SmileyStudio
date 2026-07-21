import { detectCapabilities, Capabilities } from '../utils/capabilities';
import { audioEngine } from '../audio/engine';
import { AudioRecorder } from '../audio/recorder/Recorder';
import { RecordingsRepository } from '../db/recordings';
import { autoCorrelatePitch } from '../audio/pitch/detector';
import { getPitchDetails } from '../audio/pitch/tuner';

export type StudioState = {
  isMicActive: boolean;
  isRecording: boolean;
  liveMonitor: boolean;
  noiseCancellation: boolean;
  activePresetId: string;
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
    activePresetId: 'popLead',
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
    tubeSaturation: 10,
    qualityMode: 'balanced',
    recordingsCount: 0,
  };

  private listeners: Set<StudioStateListener> = new Set();

  private constructor() {
    this.capabilities = detectCapabilities();
  }

  public static getInstance(): StudioController {
    if (!StudioController.instance) {
      StudioController.instance = new StudioController();
    }
    return StudioController.instance;
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
    try {
      await audioEngine.start({ noiseCancellation: this.state.noiseCancellation });
      this.state.isMicActive = true;
      this.applyParamsToAudioGraph();
      this.startPitchDetectionLoop();
      return true;
    } catch (err) {
      console.error('Microphone start failed:', err);
      this.state.isMicActive = false;
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
      // Auto-start mic if not running
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
      // Auto-stop mic if Live Monitor is disabled
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
    this.applyPreset(presetId);
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

  private applyPreset(presetId: string) {
    const graph = audioEngine.getGraph();
    if (!graph) return;

    if (presetId === 'popLead') {
      graph.eq.update({ type: 'highpass', frequency: 120 });
      graph.saturation.update({ amount: 15 });
    } else if (presetId === 'warmth') {
      graph.eq.update({ type: 'peaking', frequency: 250, gain: 4 });
      graph.saturation.update({ amount: 10 });
    } else if (presetId === 'lofi') {
      graph.eq.update({ type: 'bandpass', frequency: 1500 });
      graph.saturation.update({ amount: 30 });
    } else if (presetId === 'radio') {
      graph.eq.update({ type: 'bandpass', frequency: 2000 });
      graph.saturation.update({ amount: 0 });
    } else if (presetId === 'bypass') {
      graph.eq.update({ type: 'allpass' });
      graph.saturation.update({ amount: 0 });
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
