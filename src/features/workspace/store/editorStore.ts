import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { EditorStoreState } from "./editorStore.types";
import type { TimelineDocument, Track } from "../types/editor";
import { 
  MIN_CLIP_DURATION_MS, 
  updateClipInTimeline,
  getTimelineSnapPoints,
  calculateSnapPoint,
  calculateClipMoveSnap
} from "../lib/timelineMath";
import { createClipFromAsset } from "../lib/timelineFactories";
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
      hasHydratedFromCloud: false,
      
      past: [],
      future: [],

      currentTimeMs: 0,
      isPlaying: false,
      playbackRate: 1,

      recordAction: (newTimeline: TimelineDocument) => {
        const { timeline, past } = get();
        if (!timeline) return;
        set({
          past: [...past, timeline],
          future: [],
          timeline: newTimeline,
          isDirty: true,
          lastSavedAt: null,
        });
      },

      undo: () => {
        const { past, timeline, future } = get();
        if (past.length === 0 || !timeline) return;
        const previous = past[past.length - 1];
        set({
          past: past.slice(0, past.length - 1),
          future: [timeline, ...future],
          timeline: previous,
          isDirty: true,
          lastSavedAt: null,
        });
      },

      redo: () => {
        const { future, timeline, past } = get();
        if (future.length === 0 || !timeline) return;
        const next = future[0];
        set({
          past: [...past, timeline],
          future: future.slice(1),
          timeline: next,
          isDirty: true,
          lastSavedAt: null,
        });
      },

      hydrateTimeline: (timeline) => {
        // 🛠️ INJECTION: Ensure the Performance Track always exists at the top
        const hasPerformanceTrack = timeline.tracks.some(t => t.type === "performance");
        
        let hydratedTracks = timeline.tracks;
        if (!hasPerformanceTrack) {
          const performanceTrack: Track = {
            id: `track-perf-${uuidv4().slice(0, 8)}`,
            name: "🎭 Director Track",
            type: "performance",
            order: -1, // Force it to render at the very top
            clips: []
          };
          hydratedTracks = [performanceTrack, ...timeline.tracks];
        }

        const enrichedTimeline = { ...timeline, tracks: hydratedTracks };

        set({
          timeline: enrichedTimeline,
          past: [],
          future: [],
          selectedClipId: null,
          selectedTrackId: null,
          isDirty: false,
          isSaving: false,
          dragState: null,
          currentTimeMs: 0, 
          isPlaying: false,
          hasHydratedFromCloud: true, 
        });
      },

      setTimeline: (timeline, markDirty = true) => set({ timeline, isDirty: markDirty }),
      
      setPlayheadMs: (ms: number) => {
        const timeline = get().timeline;
        if (!timeline) return;
        set({ timeline: { ...timeline, playhead_ms: Math.max(0, ms) }, isDirty: true });
      },

      play: () => {
        const { timeline, currentTimeMs } = get();
        const duration = getTimelineDurationMs(timeline);
        
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

        get().recordAction({ ...timeline, tracks: updatedTracks });
      },

      // 🛠️ NEW: Used by the AI Blueprint Planner to inject pre-constructed placeholder clips
      addPreconstructedClip: (trackId, clip) => {
        const { timeline } = get();
        if (!timeline) return;

        const updatedTracks = timeline.tracks.map(track => {
          if (track.id === trackId) {
            return { ...track, clips: [...track.clips, clip] };
          }
          return track;
        });

        get().recordAction({ ...timeline, tracks: updatedTracks });
      },

      // 🛠️ NEW: Used by the AI Blueprint Planner to drop chapter markers
      addMarker: (timeMs, label, color) => {
        const { timeline } = get();
        if (!timeline) return;

        const newMarker = {
          id: uuidv4(),
          time_ms: timeMs,
          label,
          color: color || "#cccccc"
        };

        // Assuming your timeline has a markers array. If not, this initializes it.
        const markers = timeline.markers ? [...timeline.markers, newMarker] : [newMarker];
        get().recordAction({ ...timeline, markers });
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

        get().recordAction({ ...timeline, tracks: updatedTracks });
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

        get().recordAction({ ...timeline, tracks: updatedTracks });
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

        get().recordAction({ ...timeline, tracks: updatedTracks });
      },

      splitClip: () => {
        const { timeline, selectedClipId, selectedTrackId, currentTimeMs } = get();
        if (!timeline || !selectedClipId || !selectedTrackId) return;

        const track = timeline.tracks.find(t => t.id === selectedTrackId);
        const clip = track?.clips.find(c => c.id === selectedClipId);
        if (!track || !clip) return;

        const clipEndMs = clip.start_ms + clip.duration_ms;
        
        if (currentTimeMs <= clip.start_ms || currentTimeMs >= clipEndMs) return;

        const leftDuration = currentTimeMs - clip.start_ms;
        const rightDuration = clipEndMs - currentTimeMs;

        if (leftDuration < MIN_CLIP_DURATION_MS || rightDuration < MIN_CLIP_DURATION_MS) return;

        const currentOffset = clip.source_offset_ms || 0;
        
        const rightHalf = {
          ...clip,
          id: uuidv4(),
          start_ms: currentTimeMs,
          duration_ms: rightDuration,
          source_offset_ms: currentOffset + leftDuration,
        };

        const updatedTracks = timeline.tracks.map(t => {
          if (t.id === selectedTrackId) {
            const updatedClips = t.clips.map(c => 
              c.id === selectedClipId ? { ...c, duration_ms: leftDuration } : c
            );
            return { ...t, clips: [...updatedClips, rightHalf] };
          }
          return t;
        });

        get().recordAction({ ...timeline, tracks: updatedTracks });
      },

      selectClip: (clipId, trackId = null) => set({ selectedClipId: clipId, selectedTrackId: trackId }),
      startClipDrag: (dragState) => set({ dragState }),
      stopClipDrag: () => set({ dragState: null }),

      moveClip: ({ trackId, clipId, newStartMs }) => {
        const { timeline } = get();
        if (!timeline) return;
        
        const track = timeline.tracks.find(t => t.id === trackId);
        const clip = track?.clips.find(c => c.id === clipId);
        if (!track || !clip) return;

        const snapPoints = getTimelineSnapPoints(timeline, clipId);
        const snappedStart = calculateClipMoveSnap(newStartMs, clip.duration_ms, snapPoints);

        const next = updateClipInTimeline(timeline, trackId, clipId, (c) => ({ ...c, start_ms: snappedStart }));
        get().recordAction(next);
      },

      resizeClipLeft: ({ trackId, clipId, newStartMs, newDurationMs }) => {
        const { timeline } = get();
        if (!timeline || newDurationMs < MIN_CLIP_DURATION_MS) return;

        const track = timeline.tracks.find(t => t.id === trackId);
        const clip = track?.clips.find(c => c.id === clipId);
        if (!track || !clip) return;

        const snapPoints = getTimelineSnapPoints(timeline, clipId);
        const snappedStart = calculateSnapPoint(newStartMs, snapPoints);
        
        const endMs = newStartMs + newDurationMs; 
        let finalDuration = endMs - snappedStart;
        let finalStart = snappedStart;

        if (finalDuration < MIN_CLIP_DURATION_MS) {
           finalDuration = MIN_CLIP_DURATION_MS;
           finalStart = endMs - MIN_CLIP_DURATION_MS; 
        }

        const next = updateClipInTimeline(timeline, trackId, clipId, (c) => ({
          ...c, start_ms: finalStart, duration_ms: finalDuration,
        }));
        get().recordAction(next);
      },

      resizeClipRight: ({ trackId, clipId, newDurationMs }) => {
        const { timeline } = get();
        if (!timeline || newDurationMs < MIN_CLIP_DURATION_MS) return;

        const track = timeline.tracks.find(t => t.id === trackId);
        const clip = track?.clips.find(c => c.id === clipId);
        if (!track || !clip) return;

        const snapPoints = getTimelineSnapPoints(timeline, clipId);
        const intendedEnd = clip.start_ms + newDurationMs;
        const snappedEnd = calculateSnapPoint(intendedEnd, snapPoints);
        
        const finalDuration = Math.max(MIN_CLIP_DURATION_MS, snappedEnd - clip.start_ms);

        const next = updateClipInTimeline(timeline, trackId, clipId, (c) => ({
          ...c, duration_ms: finalDuration,
        }));
        get().recordAction(next);
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

        get().recordAction({ ...timeline, tracks: updatedTracks });
      },

      markSaving: () => set({ isSaving: true }),
      markSaved: () => set({ isDirty: false, isSaving: false, lastSavedAt: new Date().toISOString() }),
    }),
    {
      name: "redner-timeline-storage",
      partialize: (state) => ({ timeline: state.timeline }), 
    }
  )
);