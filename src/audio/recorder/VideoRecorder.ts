export class VideoRecorderManager {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private actualMimeType: string = 'video/mp4';

  public startRecording(combinedStream: MediaStream): void {
    this.recordedChunks = [];

    // Try MP4 first (iOS Safari, some Chrome), then WebM variants
    const mimeTypeCandidates = [
      'video/mp4;codecs=h264,aac',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];

    let selectedMime = '';
    for (const mime of mimeTypeCandidates) {
      if (MediaRecorder.isTypeSupported(mime)) {
        selectedMime = mime;
        break;
      }
    }

    if (!selectedMime) {
      console.warn('No supported video MIME type found, using default');
      selectedMime = '';
    }

    this.actualMimeType = selectedMime || 'video/mp4';

    this.mediaRecorder = new MediaRecorder(
      combinedStream,
      selectedMime ? { mimeType: selectedMime } : undefined
    );

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
        // Always output as mp4 blob type for sharing compatibility
        const videoBlob = new Blob(this.recordedChunks, { type: 'video/mp4' });
        this.recordedChunks = [];
        resolve(videoBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  public get isRecording(): boolean {
    return !!this.mediaRecorder && this.mediaRecorder.state === 'recording';
  }

  public get mimeType(): string {
    return this.actualMimeType;
  }
}
