export type UUID = string;

// 🛠️ ADDED: "performance" track type
export type TrackType = "video" | "audio" | "text" | "script" | "caption" | "avatar" | "overlay" | "performance";

// 🛠️ ADDED: "performance_instruction" for director clips
export type ClipType = "video" | "audio" | "image" | "text" | "script_segment" | "caption" | "avatar_segment" | "gap" | "placeholder" | "performance_instruction"; 

// 🛠️ NEW: Strongly typed metadata for when a clip is a "performance_instruction"
export interface PerformanceMetadata {
  directiveType: "energy" | "camera" | "expression" | "gesture";
  value: string | number;
}

// 🛠️ NEW: Marker interface for the Timeline
export interface TimelineMarker {
  id: string;
  time_ms: number;
  label: string;
  color: string;
}

export interface TimelineDocument {
  id: string;
  project_id: UUID;
  fps: number;
  duration_ms: number;
  zoom: number;
  playhead_ms: number;
  tracks: Track[];
  markers?: TimelineMarker[]; // 🛠️ ADDED: Markers array for the AI
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
  metadata?: any; // 🛠️ ADDED: Allows the AI to inject script/emotion data directly into the clip (e.g., PerformanceMetadata)
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