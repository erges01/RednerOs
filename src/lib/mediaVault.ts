// src/lib/mediaVault.ts

const VAULT_DB_NAME = 'RednerMediaVault';
const VAULT_STORE_NAME = 'media_blobs';

// 1. Initialize the dedicated Media DB
const initVaultDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(VAULT_DB_NAME, 1);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(VAULT_STORE_NAME)) {
        // We use vaultKey (which will be the assetId) as the unique identifier
        db.createObjectStore(VAULT_STORE_NAME, { keyPath: 'vaultKey' });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// 2. The Vault API
export const MediaVault = {
  // Save the raw heavy file to the browser's hard drive
  async saveBlob(vaultKey: string, file: File | Blob, mimeType: string): Promise<void> {
    const db = await initVaultDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(VAULT_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(VAULT_STORE_NAME);
      
      const request = store.put({ 
        vaultKey, 
        blob: file, 
        mimeType,
        savedAt: new Date().toISOString()
      });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  // Retrieve the raw file when the project reopens
  async getBlob(vaultKey: string): Promise<Blob | null> {
    if (!vaultKey) return null;



    const db = await initVaultDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(VAULT_STORE_NAME, 'readonly');
      const store = transaction.objectStore(VAULT_STORE_NAME);
      const request = store.get(vaultKey);
      
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.blob);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  },

  // Clean up the hard drive when an asset is deleted
  async deleteBlob(vaultKey: string): Promise<void> {
    const db = await initVaultDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(VAULT_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(VAULT_STORE_NAME);
      const request = store.delete(vaultKey);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
};