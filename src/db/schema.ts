const DB_NAME = 'SmileyStudioVaultDB';
const DB_VERSION = 1;

export class DatabaseSchema {
  private static dbPromise: Promise<IDBDatabase> | null = null;

  public static getDB(): Promise<IDBDatabase> {
    if (!DatabaseSchema.dbPromise) {
      DatabaseSchema.dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (e) => {
          const db = (e.target as IDBOpenDBRequest).result;

          // Metadata store: recordings
          if (!db.objectStoreNames.contains('recordings')) {
            const recStore = db.createObjectStore('recordings', { keyPath: 'id', autoIncrement: true });
            recStore.createIndex('createdAt', 'createdAt', { unique: false });
            recStore.createIndex('favorite', 'favorite', { unique: false });
          }

          // Binary audio blobs store: blobs
          if (!db.objectStoreNames.contains('blobs')) {
            db.createObjectStore('blobs', { keyPath: 'blobId' });
          }
        };

        req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
        req.onerror = (e) => reject((e.target as IDBOpenDBRequest).error);
      });
    }
    return DatabaseSchema.dbPromise;
  }
}
