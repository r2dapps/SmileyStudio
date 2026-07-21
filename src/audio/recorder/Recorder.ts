export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecordingState: boolean = false;

  public startRecording(stream: MediaStream): boolean {
    if (this.isRecordingState) return false;
    this.recordedChunks = [];

    const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? { mimeType: 'audio/webm;codecs=opus' }
      : undefined;

    try {
      this.mediaRecorder = new MediaRecorder(stream, options);
    } catch (e) {
      this.mediaRecorder = new MediaRecorder(stream);
    }

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(100); // 100ms timeslice chunks
    this.isRecordingState = true;
    return true;
  }

  public stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecordingState) {
        reject(new Error('Recorder is not active'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        this.isRecordingState = false;
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        this.recordedChunks = [];
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  public get isRecording(): boolean {
    return this.isRecordingState;
  }
}
