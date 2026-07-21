import { DatabaseSchema } from './schema';
import { BlobStorage } from './blobStorage';

export interface RecordingMetadata {
  id?: number;
  title: string;
  createdAt: string;
  duration: number;
  sampleRate: number;
  appVersion: string;
  presetVersion: string;
  presetName: string;
  format: 'webm' | 'wav' | 'mp4';
  favorite: boolean;
  notes: string;
  blobId: string;
  isVideo?: boolean;
  filterName?: string;
  aspectRatio?: '9:16' | '1:1' | '4:5' | '16:9';
  cameraFacing?: 'user' | 'environment';
}

export class RecordingsRepository {
  public static async saveRecording(metadata: Omit<RecordingMetadata, 'id'>, blob: Blob): Promise<number> {
    await BlobStorage.saveBlob(metadata.blobId, blob);
    const db = await DatabaseSchema.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('recordings', 'readwrite');
      const store = tx.objectStore('recordings');
      const req = store.add(metadata);
      req.onsuccess = () => resolve(req.result as number);
      req.onerror = () => reject(req.error);
    });
  }

  public static async getAllRecordings(): Promise<RecordingMetadata[]> {
    const db = await DatabaseSchema.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('recordings', 'readonly');
      const store = tx.objectStore('recordings');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as RecordingMetadata[]);
      req.onerror = () => reject(req.error);
    });
  }

  public static async deleteRecording(id: number, blobId: string): Promise<void> {
    await BlobStorage.deleteBlob(blobId);
    const db = await DatabaseSchema.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('recordings', 'readwrite');
      const store = tx.objectStore('recordings');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}
