import type { TimelineDocument } from "../types/editor";

export type DragMode = "move" | "resize-left" | "resize-right";

export interface TimelineDragState {
  clipId: string;
  trackId: string;
  mode: DragMode;
  pointerStartX: number;
  originalStartMs: number;
  originalDurationMs: number;
}

export interface EditorStoreState {
  timeline: TimelineDocument | null;
  selectedClipId: string | null;
  selectedTrackId: string | null;
  
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
  dragState: TimelineDragState | null;

  hydrateTimeline: (timeline: TimelineDocument) => void;
  setPlayheadMs: (ms: number) => void;
  selectClip: (clipId: string | null, trackId?: string | null) => void;
  
  // Drag actions
  addClip: (trackId: string, asset: any, startMs: number) => void;
  startClipDrag: (drag: TimelineDragState) => void;
  stopClipDrag: () => void;
  moveClip: (params: { trackId: string; clipId: string; newStartMs: number }) => void;
  resizeClipLeft: (params: { trackId: string; clipId: string; newStartMs: number; newDurationMs: number }) => void;
  resizeClipRight: (params: { trackId: string; clipId: string; newDurationMs: number }) => void;
  // ... inside your EditorStoreState interface ...

  // Add this line with your other drag actions:
  removeClip: (trackId: string, clipId: string) => void;

// ...

  // Save states
  markSaving: () => void;
  markSaved: () => void;
  setTimeline: (timeline: TimelineDocument, markDirty?: boolean) => void;
}