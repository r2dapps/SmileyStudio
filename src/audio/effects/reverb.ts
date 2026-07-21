import { BaseEffect } from './BaseEffect';

export class ReverbEffect extends BaseEffect {
  private convolver: ConvolverNode;

  constructor(audioContext: AudioContext) {
    super(audioContext);
    this.convolver = this.ctx.createConvolver();
    this.convolver.buffer = this.generateImpulseResponse(2.5, 2.0);

    this.input.connect(this.convolver);
    this.convolver.connect(this.wetGain);
    this.wetGain.connect(this.output);
  }

  private generateImpulseResponse(duration: number, decay: number): AudioBuffer {
    const sampleRate = this.ctx.sampleRate || 44100;
    const length = sampleRate * duration;
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = length - i;
      left[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
      right[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
    }
    return impulse;
  }

  public update(params: { wet?: number }): void {
    const now = this.ctx.currentTime;
    if (params.wet !== undefined) {
      this.wetGain.gain.setTargetAtTime(params.wet, now, 0.02);
    }
  }
}
