import { BaseEffect } from './BaseEffect';

export class CompressorEffect extends BaseEffect {
  private comp: DynamicsCompressorNode;

  constructor(audioContext: AudioContext) {
    super(audioContext);
    this.comp = this.ctx.createDynamicsCompressor();
    this.comp.threshold.value = -24;
    this.comp.knee.value = 30;
    this.comp.ratio.value = 4;
    this.comp.attack.value = 0.003;
    this.comp.release.value = 0.25;

    this.input.connect(this.comp);
    this.comp.connect(this.wetGain);
    this.wetGain.connect(this.output);
  }

  public update(params: { threshold?: number; ratio?: number; attack?: number; release?: number }): void {
    const now = this.ctx.currentTime;
    if (params.threshold !== undefined) this.comp.threshold.setTargetAtTime(params.threshold, now, 0.02);
    if (params.ratio !== undefined) this.comp.ratio.setTargetAtTime(params.ratio, now, 0.02);
    if (params.attack !== undefined) this.comp.attack.setTargetAtTime(params.attack, now, 0.02);
    if (params.release !== undefined) this.comp.release.setTargetAtTime(params.release, now, 0.02);
  }
}
