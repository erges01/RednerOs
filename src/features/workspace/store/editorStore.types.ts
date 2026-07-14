import type { TimelineDocument, Clip } from "../types/editor";

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

  // --- NEW: Playback State ---
  currentTimeMs: number;
  isPlaying: boolean;
  playbackRate: number;
  hasHydratedFromCloud: boolean;

  hydrateTimeline: (timeline: TimelineDocument) => void;
  selectClip: (clipId: string | null, trackId?: string | null) => void;
  
  // --- Clip Creation & Deletion ---
  addClip: (trackId: string, asset: { id: string; name: string; type: string }, startMs: number) => void;
  addClipFromAsset: (asset: { id: string; name: string; type: string }, trackId: string, startMs: number) => void;
  removeClip: (trackId: string, clipId: string) => void;

  // --- Inspector Clip Actions ---
  updateClipMeta: (trackId: string, clipId: string, updates: Partial<Clip>) => void;
  duplicateClip: (trackId: string, clipId: string) => void;

  // --- Drag & Resize Actions ---
  startClipDrag: (drag: TimelineDragState) => void;
  stopClipDrag: () => void;
  moveClip: (params: { trackId: string; clipId: string; newStartMs: number }) => void;
  resizeClipLeft: (params: { trackId: string; clipId: string; newStartMs: number; newDurationMs: number }) => void;
  resizeClipRight: (params: { trackId: string; clipId: string; newDurationMs: number }) => void;

  // --- NEW: Playback Actions ---
  play: () => void;
  pause: () => void;
  togglePlayback: () => void;
  seekTo: (timeMs: number) => void;
  setPlaybackRate: (rate: number) => void;

  // --- Save States ---
  markSaving: () => void;
  markSaved: () => void;
  setTimeline: (timeline: TimelineDocument, markDirty?: boolean) => void;

  // --- HISTORY STACKS ---
  past: TimelineDocument[];
  future: TimelineDocument[];
  undo: () => void;
  redo: () => void;
  recordAction: (newTimeline: TimelineDocument) => void;

  addPreconstructedClip: (trackId: string, clip: any) => void;
  addMarker: (timeMs: number, label: string, color?: string) => void;

  // --- THE RAZOR TOOL ---
  splitClip: () => void;
}