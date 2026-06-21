export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  localUrl: string;
  size: number;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  assets: Asset[];
  timeline: unknown[];
}
