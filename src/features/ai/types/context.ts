// src/features/ai/types/context.ts

export interface AIClipSnapshot {
  id: string;
  type: "video" | "audio" | "image" | "text";
  startMs: number;
  durationMs: number;
  sourceOffsetMs: number;
  label: string;
}

export interface AITrackSnapshot {
  id: string;
  type: "video" | "audio" | "text"; // <-- FIX: Added "text" to the union type
  clips: AIClipSnapshot[];
}

export interface AISelectionSnapshot {
  selectedClipId: string | null;
  selectedTrackId: string | null;
}

export interface AIPlaybackSnapshot {
  currentTimeMs: number;
  isPlaying: boolean;
}

export interface AIProjectSnapshot {
  totalDurationMs: number;
  trackCount: number;
  clipCount: number;
}

/**
 * The ultimate payload sent to the LLM. 
 * This is the exact state of the editor, normalized and stripped of UI clutter.
 */
export interface AIContextSnapshot {
  project: AIProjectSnapshot;
  tracks: AITrackSnapshot[];
  selection: AISelectionSnapshot;
  playback: AIPlaybackSnapshot;
}