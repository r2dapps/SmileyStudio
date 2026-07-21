import { AudioEncoder } from './Encoder';
import { BlobManager } from './BlobManager';

export class ExportManager {
  /**
   * Downloads audio as WAV (universally compatible) or video as MP4/WebM.
   * Browser MP3 encoding requires external libs (lamejs). We produce a proper
   * WAV file and name it .wav — it opens in all music apps and WhatsApp.
   * For video we pass the blob through directly with mp4 extension.
   */
  public static async exportTake(
    blob: Blob,
    filename: string,
    type: 'audio' | 'video' = 'audio'
  ): Promise<void> {
    let finalBlob = blob;
    let ext = 'wav';

    if (type === 'video') {
      // Prefer mp4 extension for sharing; blob may be webm but most players handle it
      ext = 'mp4';
      // Retype the blob as mp4 for share compatibility
      finalBlob = new Blob([blob], { type: 'video/mp4' });
    } else {
      // Convert to WAV for broadest audio compatibility (plays in WhatsApp, iOS, etc.)
      try {
        const arrayBuffer = await blob.arrayBuffer();
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        finalBlob = AudioEncoder.bufferToWav(decodedBuffer);
        ext = 'wav';
      } catch (err) {
        console.warn('WAV conversion failed, exporting original:', err);
        ext = 'webm';
      }
    }

    const url = BlobManager.createURL(finalBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => BlobManager.revokeURL(url), 10000);
  }

  /**
   * Share audio as WAV or video as MP4 via Web Share API.
   * Falls back to clipboard + download if share is unavailable.
   */
  public static async shareTake(
    blob: Blob,
    filename: string,
    type: 'audio' | 'video' = 'audio'
  ): Promise<boolean> {
    let finalBlob = blob;
    let ext = 'wav';
    let mime = 'audio/wav';

    if (type === 'video') {
      ext = 'mp4';
      mime = 'video/mp4';
      finalBlob = new Blob([blob], { type: 'video/mp4' });
    } else {
      try {
        const arrayBuffer = await blob.arrayBuffer();
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        finalBlob = AudioEncoder.bufferToWav(decodedBuffer);
        ext = 'wav';
        mime = 'audio/wav';
      } catch (err) {
        console.warn('WAV conversion for share failed:', err);
        ext = 'webm';
        mime = 'audio/webm';
      }
    }

    const appUrl = 'https://r2dapps.github.io/SmileyStudio/';
    const file = new File([finalBlob], `${filename}.${ext}`, { type: mime });

    const shareData = {
      title: `${filename} - Smiley Studio 💖`,
      text: `Check out my ${type === 'video' ? 'video reel' : 'vocal take'} recorded on Smiley Studio 💖!\n${appUrl}`,
      url: appUrl,
      files: [file],
    };

    // Try native Web Share with file
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share(shareData);
        return true;
      } catch (err: any) {
        if ((err as any).name === 'AbortError') return false;
        console.warn('File share failed, falling back to URL share:', err);
      }
    }

    // Fallback: share URL only
    if (navigator.share) {
      try {
        await navigator.share({ title: shareData.title, text: shareData.text, url: appUrl });
        return true;
      } catch (err) {}
    }

    // Last resort: clipboard + auto-download
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareData.text);
      alert(`Link copied to clipboard!\nDownloading ${ext.toUpperCase()} file...`);
    }
    await ExportManager.exportTake(finalBlob, filename, type);
    return false;
  }
}
