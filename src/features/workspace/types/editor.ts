export type UUID = string;

export type TrackType = "video" | "audio" | "text" | "script" | "caption" | "avatar" | "overlay";
export type ClipType = "video" | "audio" | "image" | "text" | "script_segment" | "caption" | "avatar_segment" | "gap";

export interface TimelineDocument {
  id: string;
  project_id: UUID;
  fps: number;
  duration_ms: number;
  zoom: number;
  playhead_ms: number;
  tracks: Track[];
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  order: number;
  muted?: boolean;
  locked?: boolean;
  hidden?: boolean;
  clips: Clip[];
}

export interface Clip {
  id: string;
  track_id: string;
  type: ClipType;
  start_ms: number;
  duration_ms: number;
  source_offset_ms?: number | null;
  asset_id?: UUID | null;
  label?: string | null;
  color?: string | null;
}

// Responses from Rust
export interface ProjectEditorResponse {
  project: any; // We'll keep it any for now so it doesn't clash with your existing Project type
  assets: any[];
  timeline: TimelineDocument;
}

export interface TimelineResponse {
  timeline: TimelineDocument;
}