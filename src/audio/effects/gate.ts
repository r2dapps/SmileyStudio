import { BaseEffect } from './BaseEffect';

export class NoiseGateEffect extends BaseEffect {
  private threshold: number = 0.01;
  private gateGain: GainNode;

  constructor(audioContext: AudioContext) {
    super(audioContext);
    this.gateGain = this.ctx.createGain();
    
    // Routing: input -> gateGain -> wetGain -> output
    this.input.connect(this.gateGain);
    this.gateGain.connect(this.wetGain);
    this.wetGain.connect(this.output);
  }

  public processRMS(rms: number): void {
    if (!this.enabled) return;
    const now = this.ctx.currentTime;
    if (this.threshold > 0 && rms < this.threshold) {
      this.gateGain.gain.setTargetAtTime(0, now, 0.03);
    } else {
      this.gateGain.gain.setTargetAtTime(1.0, now, 0.02);
    }
  }

  public update(params: { threshold?: number }): void {
    if (params.threshold !== undefined) {
      this.threshold = params.threshold;
    }
  }
}
