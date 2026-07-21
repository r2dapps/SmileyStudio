import { BaseEffect } from './BaseEffect';

export class DelayEffect extends BaseEffect {
  private delayNode: DelayNode;
  private feedbackGain: GainNode;

  constructor(audioContext: AudioContext) {
    super(audioContext);
    this.delayNode = this.ctx.createDelay(1.0);
    this.delayNode.delayTime.value = 0.25;

    this.feedbackGain = this.ctx.createGain();
    this.feedbackGain.gain.value = 0.4;

    // Feedback Loop Routing
    this.input.connect(this.delayNode);
    this.delayNode.connect(this.feedbackGain);
    this.feedbackGain.connect(this.delayNode);

    this.delayNode.connect(this.wetGain);
    this.wetGain.connect(this.output);
  }

  public update(params: { time?: number; feedback?: number }): void {
    const now = this.ctx.currentTime;
    if (params.time !== undefined) {
      this.delayNode.delayTime.setTargetAtTime(params.time, now, 0.02);
    }
    if (params.feedback !== undefined) {
      this.feedbackGain.gain.setTargetAtTime(params.feedback, now, 0.02);
    }
  }
}
