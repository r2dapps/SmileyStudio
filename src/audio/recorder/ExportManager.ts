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

  public static async shareTake(
    audioBlob: Blob,
    filename: string,
    format: 'wav' | 'webm' = 'wav'
  ): Promise<boolean> {
    let finalBlob = audioBlob;
    if (format === 'wav' && audioBlob.type !== 'audio/wav') {
      try {
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        finalBlob = AudioEncoder.bufferToWav(decodedBuffer);
      } catch (err) {
        console.warn('WAV conversion fallback for share failed:', err);
      }
    }

    const ext = format === 'wav' ? 'wav' : 'webm';
    const mime = format === 'wav' ? 'audio/wav' : 'audio/webm';
    const file = new File([finalBlob], `${filename}.${ext}`, { type: mime });
    const appUrl = 'https://r2dapps.github.io/SmileyStudio/';

    const shareData = {
      title: `${filename} - Smiley Studio 💖`,
      text: `Listen to my vocal take recorded on Smiley Studio 💖!\n${appUrl}`,
      url: appUrl,
      files: [file],
    };

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share(shareData);
        return true;
      } catch (err) {
        if ((err as any).name !== 'AbortError') {
          console.warn('Native file share failed, trying text share:', err);
        } else {
          return false;
        }
      }
    }

    // Fallback: share text & URL or copy to clipboard
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          url: appUrl,
        });
        return true;
      } catch (err) {}
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareData.text);
      alert(`Share text & App URL copied to clipboard!\nDownloading audio file...`);
    }
    await ExportManager.exportTake(finalBlob, filename, format);
    return false;
  }
}
