export abstract class BaseEffect {
  protected ctx: AudioContext;
  public input: GainNode;
  public output: GainNode;
  protected dryGain: GainNode;
  protected wetGain: GainNode;
  private _enabled: boolean = true;

  constructor(audioContext: AudioContext) {
    this.ctx = audioContext;
    this.input = this.ctx.createGain();
    this.output = this.ctx.createGain();
    this.dryGain = this.ctx.createGain();
    this.wetGain = this.ctx.createGain();

    // Default bypass routing
    this.input.connect(this.dryGain);
    this.dryGain.connect(this.output);
    this.dryGain.gain.value = 0;
    this.wetGain.gain.value = 1;
  }

  public get enabled(): boolean {
    return this._enabled;
  }

  public set enabled(val: boolean) {
    this._enabled = val;
    const now = this.ctx.currentTime;
    if (val) {
      this.dryGain.gain.setTargetAtTime(0, now, 0.02);
      this.wetGain.gain.setTargetAtTime(1, now, 0.02);
    } else {
      this.dryGain.gain.setTargetAtTime(1, now, 0.02);
      this.wetGain.gain.setTargetAtTime(0, now, 0.02);
    }
  }

  public connect(destination: AudioNode | BaseEffect): void {
    const destNode = destination instanceof BaseEffect ? destination.input : destination;
    this.output.connect(destNode);
  }

  public disconnect(): void {
    this.output.disconnect();
  }

  public abstract update(params: Record<string, any>): void;

  public dispose(): void {
    this.disconnect();
    this.input.disconnect();
    this.output.disconnect();
  }
}
