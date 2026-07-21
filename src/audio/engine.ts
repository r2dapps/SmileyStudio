import { audioContextManager } from './context';
import { GraphBuilder } from './graph/GraphBuilder';
import { MicrophoneManager } from './microphone';

export class AudioEngine {
  private static instance: AudioEngine;
  private micManager: MicrophoneManager;
  private graph: GraphBuilder | null = null;
  private analyser: AnalyserNode | null = null;

  private constructor() {
    this.micManager = new MicrophoneManager();
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  public async start(options: { noiseCancellation?: boolean } = {}): Promise<boolean> {
    const ctx = audioContextManager.getContext();
    await audioContextManager.resume();

    if (!this.graph) {
      this.graph = new GraphBuilder(ctx);
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.graph.outputNode.connect(this.analyser);
      this.analyser.connect(ctx.destination);
    }

    const source = await this.micManager.startMic(ctx, options);
    source.connect(this.graph.inputNode);
    return true;
  }

  public stop(): void {
    this.micManager.stopMic();
  }

  public get isMicActive(): boolean {
    return this.micManager.isActive;
  }

  public getGraph(): GraphBuilder | null {
    return this.graph;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }
}

export const audioEngine = AudioEngine.getInstance();
