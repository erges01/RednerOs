import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { EditorStoreState } from "./editorStore.types";
import { MIN_CLIP_DURATION_MS, updateClipInTimeline } from "../lib/timelineMath";
import { createClipFromAsset } from "../lib/timelineFactories";
// --- NEW: Import our timeline duration selector ---
import { getTimelineDurationMs } from "../lib/playbackSelectors"; 

export const useEditorStore = create<EditorStoreState>()(
  persist(
    (set, get) => ({
      timeline: null,
      selectedClipId: null,
      selectedTrackId: null,
      isDirty: false,
      isSaving: false,
      lastSavedAt: null,
      dragState: null,

      // --- THE CLOUD LOCK ---
      hasHydratedFromCloud: false,

      // --- NEW: Playback State ---
      currentTimeMs: 0,
      isPlaying: false,
      playbackRate: 1,

      hydrateTimeline: (timeline) => {
        set({
          timeline,
          selectedClipId: null,
          selectedTrackId: null,
          isDirty: false,
          isSaving: false,
          dragState: null,
          currentTimeMs: 0, // Reset clock on load
          isPlaying: false,
          hasHydratedFromCloud: true, // <-- UNLOCKS THE AUTOSAVE!
        });
      },

      setTimeline: (timeline, markDirty = true) => set({ timeline, isDirty: markDirty }),
      
      setPlayheadMs: (ms: number) => {
        const timeline = get().timeline;
        if (!timeline) return;
        set({ timeline: { ...timeline, playhead_ms: Math.max(0, ms) }, isDirty: true });
      },

      // --- NEW: Playback Actions ---
      play: () => {
        const { timeline, currentTimeMs } = get();
        const duration = getTimelineDurationMs(timeline);
        
        // If we are at the end of the video, restart from 0
        if (currentTimeMs >= duration && duration > 0) {
          set({ currentTimeMs: 0, isPlaying: true });
        } else {
          set({ isPlaying: true });
        }
      },
      
      pause: () => set({ isPlaying: false }),
      
      togglePlayback: () => {
        const state = get();
        state.isPlaying ? state.pause() : state.play();
      },
      
      seekTo: (timeMs) => set({ currentTimeMs: Math.max(0, timeMs) }),
      
      setPlaybackRate: (rate) => set({ playbackRate: rate }),
      // -----------------------------

      addClip: (trackId, asset, startMs) => {
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
          color: null
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
        });
      },

      removeClip: (trackId, clipId) => {
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
        });
      },

      updateClipMeta: (trackId, clipId, updates) => {
        const { timeline } = get();
        if (!timeline) return;

        const updatedTracks = timeline.tracks.map(track => {
          if (track.id === trackId) {
            return {
              ...track,
              clips: track.clips.map(clip => clip.id === clipId ? { ...clip, ...updates } : clip)
            };
          }
          return track;
        });

        set({ 
          timeline: { ...timeline, tracks: updatedTracks }, 
          isDirty: true, 
          lastSavedAt: null 
        });
      },

      duplicateClip: (trackId, clipId) => {
        const { timeline } = get();
        if (!timeline) return;

        const track = timeline.tracks.find(t => t.id === trackId);
        const clipToCopy = track?.clips.find(c => c.id === clipId);
        if (!track || !clipToCopy) return;

        const cloneClip = {
          ...clipToCopy,
          id: uuidv4(),
          start_ms: clipToCopy.start_ms + clipToCopy.duration_ms + 100,
        };

        const updatedTracks = timeline.tracks.map(t => {
          if (t.id === trackId) {
            return { ...t, clips: [...t.clips, cloneClip] };
          }
          return t;
        });

        set({ 
          timeline: { ...timeline, tracks: updatedTracks }, 
          isDirty: true, 
          lastSavedAt: null 
        });
      },

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

      addClipFromAsset: (asset, trackId, startMs) => {
        const { timeline } = get();
        if (!timeline) return;

        const newClip = createClipFromAsset(asset, trackId, startMs);

        const updatedTracks = timeline.tracks.map((track) => {
          if (track.id === trackId) {
            return { ...track, clips: [...track.clips, newClip] };
          }
          return track;
        });

        set({
          timeline: { ...timeline, tracks: updatedTracks },
          isDirty: true,
          lastSavedAt: null,
        });
      },

      markSaving: () => set({ isSaving: true }),
      markSaved: () => set({ isDirty: false, isSaving: false, lastSavedAt: new Date().toISOString() }),
    }),
    {
      name: "redner-timeline-storage",
      partialize: (state) => ({ timeline: state.timeline }), // Only persist the actual timeline data!
    }
  )
);