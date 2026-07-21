class AudioContextManager {
  private static instance: AudioContextManager;
  private ctx: AudioContext | null = null;

  private constructor() {}

  public static getInstance(): AudioContextManager {
    if (!AudioContextManager.instance) {
      AudioContextManager.instance = new AudioContextManager();
    }
    return AudioContextManager.instance;
  }

  public getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass({ latencyHint: 'interactive' });
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public async resume(): Promise<void> {
    const context = this.getContext();
    if (context.state === 'suspended') {
      await context.resume();
    }
  }

  public get sampleRate(): number {
    return this.getContext().sampleRate;
  }

  public get currentTime(): number {
    return this.getContext().currentTime;
  }
}

export const audioContextManager = AudioContextManager.getInstance();
