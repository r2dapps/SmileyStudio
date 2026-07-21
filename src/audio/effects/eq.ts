import { BaseEffect } from './BaseEffect';

export class EQEffect extends BaseEffect {
  private filter: BiquadFilterNode;

  constructor(audioContext: AudioContext) {
    super(audioContext);
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'highpass';
    this.filter.frequency.value = 80;

    this.input.connect(this.filter);
    this.filter.connect(this.wetGain);
    this.wetGain.connect(this.output);
  }

  public update(params: { type?: BiquadFilterType; frequency?: number; gain?: number; Q?: number }): void {
    const now = this.ctx.currentTime;
    if (params.type) this.filter.type = params.type;
    if (params.frequency !== undefined) this.filter.frequency.setTargetAtTime(params.frequency, now, 0.02);
    if (params.gain !== undefined) this.filter.gain.setTargetAtTime(params.gain, now, 0.02);
    if (params.Q !== undefined) this.filter.Q.setTargetAtTime(params.Q, now, 0.02);
  }
}
