export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  size: number;
  createdAt: string;
  
  // --- THE NEW VAULT ARCHITECTURE ---
  vaultKey: string;     // The permanent ID that points to IndexedDB
  localUrl?: string;    // The temporary browser link (Optional because it dies on reload)
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  assets: Asset[];
  timeline: unknown[];
}