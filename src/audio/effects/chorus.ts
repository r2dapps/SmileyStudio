import { BaseEffect } from './BaseEffect';

export class ChorusEffect extends BaseEffect {
  private chorusDelay: DelayNode;
  private lfo: OscillatorNode;
  private lfoGain: GainNode;

  constructor(audioContext: AudioContext) {
    super(audioContext);
    this.chorusDelay = this.ctx.createDelay();
    this.chorusDelay.delayTime.value = 0.03;

    this.lfo = this.ctx.createOscillator();
    this.lfo.frequency.value = 1.5;

    this.lfoGain = this.ctx.createGain();
    this.lfoGain.gain.value = 0.002;

    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.chorusDelay.delayTime);
    this.lfo.start();

    this.input.connect(this.chorusDelay);
    this.chorusDelay.connect(this.wetGain);
    this.wetGain.connect(this.output);
  }

  public update(params: { depth?: number; rate?: number }): void {
    const now = this.ctx.currentTime;
    if (params.depth !== undefined) {
      this.wetGain.gain.setTargetAtTime(params.depth, now, 0.02);
    }
    if (params.rate !== undefined) {
      this.lfo.frequency.setTargetAtTime(params.rate, now, 0.02);
    }
  }
}
