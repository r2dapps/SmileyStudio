import { AudioEncoder } from './Encoder';
import { BlobManager } from './BlobManager';

export class ExportManager {
  public static async exportTake(
    audioBlob: Blob,
    filename: string,
    format: 'webm' | 'wav' = 'webm'
  ): Promise<void> {
    let finalBlob = audioBlob;

    if (format === 'wav' && audioBlob.type !== 'audio/wav') {
      try {
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        finalBlob = AudioEncoder.bufferToWav(decodedBuffer);
      } catch (err) {
        console.warn('WAV conversion fallback failed, exporting as WebM:', err);
      }
    }

    const url = BlobManager.createURL(finalBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => BlobManager.revokeURL(url), 10000);
  }
}
