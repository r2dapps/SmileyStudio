export class MicrophoneManager {
  private stream: MediaStream | null = null;
  private mediaSource: MediaStreamAudioSourceNode | null = null;

  public async startMic(ctx: AudioContext, deviceId?: string): Promise<MediaStreamAudioSourceNode> {
    this.stopMic();

    const constraints: MediaStreamConstraints = {
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
      },
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (e) {
      // Fallback constraints if exact deviceId fails
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    }

    this.mediaSource = ctx.createMediaStreamSource(this.stream);
    return this.mediaSource;
  }

  public stopMic(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.mediaSource) {
      this.mediaSource.disconnect();
      this.mediaSource = null;
    }
  }

  public get isActive(): boolean {
    return !!this.stream && this.stream.active;
  }
}
