import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { EditorStoreState } from "./editorStore.types";
import { MIN_CLIP_DURATION_MS, updateClipInTimeline } from "../lib/timelineMath";

export const useEditorStore = create<EditorStoreState>((set, get) => ({
  timeline: null,
  selectedClipId: null,
  selectedTrackId: null,
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
  dragState: null,

  hydrateTimeline: (timeline) => {
    set({
      timeline,
      selectedClipId: null,
      selectedTrackId: null,
      isDirty: false,
      isSaving: false,
      dragState: null,
    });
  },

  setTimeline: (timeline, markDirty = true) => set({ timeline, isDirty: markDirty }),
  
  setPlayheadMs: (ms) => {
    const timeline = get().timeline;
    if (!timeline) return;
    set({ timeline: { ...timeline, playhead_ms: Math.max(0, ms) }, isDirty: true });
  },

  addClip: (trackId: string, asset: any, startMs: number) => {
    const { timeline } = get();
    if (!timeline) return;

    const newClip: any = { 
      id: uuidv4(),
      track_id: trackId,
      type: asset.type === "video" ? "video" : asset.type === "audio" ? "audio" : "image",
      start_ms: Math.round(startMs),
      duration_ms: 5000,
      source_offset_ms: 0,
      asset_id: asset.id,
      label: asset.name,
      color: null,
      content: null 
    };

    const updatedTracks = timeline.tracks.map(track => {
      if (track.id === trackId) {
        return { ...track, clips: [...track.clips, newClip] };
      }
      return track;
    });

    set({ 
      timeline: { ...timeline, tracks: updatedTracks },
      isDirty: true,
      lastSavedAt: null, 
      isSaving: true 
    });
  },

  // --- NEW: Remove Clip Logic ---
  removeClip: (trackId: string, clipId: string) => {
    const { timeline } = get();
    if (!timeline) return;

    const updatedTracks = timeline.tracks.map(track => {
      if (track.id === trackId) {
        return { ...track, clips: track.clips.filter(c => c.id !== clipId) };
      }
      return track;
    });

    set({ 
      timeline: { ...timeline, tracks: updatedTracks },
      isDirty: true,
      lastSavedAt: null,
      isSaving: true 
    });
  },
  // ------------------------------

  selectClip: (clipId, trackId = null) => set({ selectedClipId: clipId, selectedTrackId: trackId }),
  startClipDrag: (dragState) => set({ dragState }),
  stopClipDrag: () => set({ dragState: null }),

  moveClip: ({ trackId, clipId, newStartMs }) => {
    const timeline = get().timeline;
    if (!timeline) return;
    const next = updateClipInTimeline(timeline, trackId, clipId, (c) => ({ ...c, start_ms: Math.max(0, newStartMs) }));
    set({ timeline: next, isDirty: true });
  },

  resizeClipLeft: ({ trackId, clipId, newStartMs, newDurationMs }) => {
    const timeline = get().timeline;
    if (!timeline) return;
    if (newDurationMs < MIN_CLIP_DURATION_MS) return;
    const next = updateClipInTimeline(timeline, trackId, clipId, (c) => ({
      ...c, start_ms: Math.max(0, newStartMs), duration_ms: Math.max(MIN_CLIP_DURATION_MS, newDurationMs),
    }));
    set({ timeline: next, isDirty: true });
  },

  resizeClipRight: ({ trackId, clipId, newDurationMs }) => {
    const timeline = get().timeline;
    if (!timeline) return;
    if (newDurationMs < MIN_CLIP_DURATION_MS) return;
    const next = updateClipInTimeline(timeline, trackId, clipId, (c) => ({
      ...c, duration_ms: Math.max(MIN_CLIP_DURATION_MS, newDurationMs),
    }));
    set({ timeline: next, isDirty: true });
  },

  markSaving: () => set({ isSaving: true }),
  markSaved: () => set({ isDirty: false, isSaving: false, lastSavedAt: new Date().toISOString() }),
}));