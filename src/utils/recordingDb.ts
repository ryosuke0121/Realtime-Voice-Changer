const DB_NAME = 'voice-changer-recordings';
const STORE_NAME = 'chunks';
const DB_VERSION = 1;
const ACTIVE_SESSION_KEY = 'activeRecordingSession';

let db: IDBDatabase | null = null;

const openDb = (): Promise<IDBDatabase> => {
    if (db) return Promise.resolve(db);
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (e) => {
            const database = (e.target as IDBOpenDBRequest).result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                const store = database.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                store.createIndex('sessionId', 'sessionId', { unique: false });
            }
        };
        request.onsuccess = (e) => {
            db = (e.target as IDBOpenDBRequest).result;
            resolve(db);
        };
        request.onerror = () => reject(request.error);
    });
};

export const saveChunk = async (sessionId: string, blob: Blob): Promise<void> => {
    const database = await openDb();
    return new Promise((resolve, reject) => {
        const tx = database.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.add({ sessionId, blob, timestamp: Date.now() });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
};

export const loadChunks = async (sessionId: string): Promise<Blob[]> => {
    const database = await openDb();
    return new Promise((resolve, reject) => {
        const tx = database.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const index = store.index('sessionId');
        const request = index.getAll(sessionId);
        request.onsuccess = () => {
            const results = request.result as Array<{ blob: Blob }>;
            resolve(results.map(r => r.blob));
        };
        request.onerror = () => reject(request.error);
    });
};

export const clearChunks = async (sessionId: string): Promise<void> => {
    const database = await openDb();
    return new Promise((resolve, reject) => {
        const tx = database.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const index = store.index('sessionId');
        const request = index.getAllKeys(sessionId);
        request.onsuccess = () => {
            const keys = request.result as IDBValidKey[];
            for (const key of keys) store.delete(key);
        };
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
};

export const getActiveSessionId = (): string | null =>
    localStorage.getItem(ACTIVE_SESSION_KEY);

export const setActiveSessionId = (id: string): void =>
    localStorage.setItem(ACTIVE_SESSION_KEY, id);

export const clearActiveSessionId = (): void =>
    localStorage.removeItem(ACTIVE_SESSION_KEY);
