import { DatabaseSchema } from './schema';

export class BlobStorage {
  public static async saveBlob(blobId: string, blob: Blob): Promise<void> {
    const db = await DatabaseSchema.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('blobs', 'readwrite');
      const store = tx.objectStore('blobs');
      const req = store.put({ blobId, audioBlob: blob, mimeType: blob.type });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public static async getBlob(blobId: string): Promise<Blob | null> {
    const db = await DatabaseSchema.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('blobs', 'readonly');
      const store = tx.objectStore('blobs');
      const req = store.get(blobId);
      req.onsuccess = () => resolve(req.result ? req.result.audioBlob : null);
      req.onerror = () => reject(req.error);
    });
  }

  public static async deleteBlob(blobId: string): Promise<void> {
    const db = await DatabaseSchema.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('blobs', 'readwrite');
      const store = tx.objectStore('blobs');
      const req = store.delete(blobId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}
