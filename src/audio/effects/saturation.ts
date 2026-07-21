import { BaseEffect } from './BaseEffect';

export class SaturationEffect extends BaseEffect {
  private waveshaper: WaveShaperNode;

  constructor(audioContext: AudioContext) {
    super(audioContext);
    this.waveshaper = this.ctx.createWaveShaper();
    this.waveshaper.curve = this.makeDistortionCurve(10) as any;

    this.input.connect(this.waveshaper);
    this.waveshaper.connect(this.wetGain);
    this.wetGain.connect(this.output);
  }

  private makeDistortionCurve(amount: number): Float32Array | null {
    if (amount <= 0) return null;
    const k = amount;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  public update(params: { amount?: number }): void {
    if (params.amount !== undefined) {
      this.waveshaper.curve = this.makeDistortionCurve(params.amount) as any;
    }
  }
}
