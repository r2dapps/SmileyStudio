export class VideoRecorderManager {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  public startRecording(combinedStream: MediaStream): void {
    this.recordedChunks = [];
    let mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/mp4';
    }

    this.mediaRecorder = new MediaRecorder(combinedStream, { mimeType });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(100);
  }

  public stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        return reject(new Error('Video recorder not initialized'));
      }

      this.mediaRecorder.onstop = () => {
        const type = this.recordedChunks[0]?.type || 'video/webm';
        const videoBlob = new Blob(this.recordedChunks, { type });
        this.recordedChunks = [];
        resolve(videoBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  public get isRecording(): boolean {
    return !!this.mediaRecorder && this.mediaRecorder.state === 'recording';
  }
}
