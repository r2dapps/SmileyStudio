import { BaseEffect } from '../effects/BaseEffect';
import { NoiseGateEffect } from '../effects/gate';
import { EQEffect } from '../effects/eq';
import { CompressorEffect } from '../effects/compressor';
import { SaturationEffect } from '../effects/saturation';
import { ChorusEffect } from '../effects/chorus';
import { DelayEffect } from '../effects/delay';
import { ReverbEffect } from '../effects/reverb';

export class GraphBuilder {
  private ctx: AudioContext;
  public gate: NoiseGateEffect;
  public eq: EQEffect;
  public comp: CompressorEffect;
  public saturation: SaturationEffect;
  public chorus: ChorusEffect;
  public delay: DelayEffect;
  public reverb: ReverbEffect;
  public inputNode: GainNode;
  public outputNode: GainNode;

  constructor(audioContext: AudioContext) {
    this.ctx = audioContext;
    this.inputNode = this.ctx.createGain();
    this.outputNode = this.ctx.createGain();

    // Instantiate effect plugins
    this.gate = new NoiseGateEffect(this.ctx);
    this.eq = new EQEffect(this.ctx);
    this.comp = new CompressorEffect(this.ctx);
    this.saturation = new SaturationEffect(this.ctx);
    this.chorus = new ChorusEffect(this.ctx);
    this.delay = new DelayEffect(this.ctx);
    this.reverb = new ReverbEffect(this.ctx);

    this.buildGraph();
  }

  public buildGraph(): void {
    // Chain: Input -> Gate -> EQ -> Comp -> Saturation -> (Chorus + Delay + Reverb + Dry) -> Output
    this.inputNode.connect(this.gate.input);
    this.gate.connect(this.eq);
    this.eq.connect(this.comp);
    this.comp.connect(this.saturation);

    // Parallel FX bus outputs to OutputNode
    this.saturation.connect(this.chorus);
    this.chorus.connect(this.outputNode);

    this.saturation.connect(this.delay);
    this.delay.connect(this.outputNode);

    this.saturation.connect(this.reverb);
    this.reverb.connect(this.outputNode);

    // Direct Dry Pass-through
    this.saturation.connect(this.outputNode);
  }

  public setMicGain(gainValue: number): void {
    this.inputNode.gain.setTargetAtTime(gainValue, this.ctx.currentTime, 0.02);
  }
}
