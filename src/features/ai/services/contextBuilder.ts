// src/features/ai/services/contextBuilder.ts
import { useEditorStore } from "../../workspace/store/editorStore";
import { getTimelineDurationMs } from "../../workspace/lib/playbackSelectors";
import type { AIContextSnapshot, AITrackSnapshot, AIClipSnapshot } from "../types/context";

export function buildCreativeContext(): AIContextSnapshot | null {
  // Grab the absolute latest state directly from the store
  const state = useEditorStore.getState();
  const timeline = state.timeline;

  if (!timeline) {
    return null; // Can't build context if there is no project open
  }

  // 1. Map Tracks & Clips into the lightweight AI format
  let totalClips = 0;
  const tracks: AITrackSnapshot[] = timeline.tracks.map((track) => {
    totalClips += track.clips.length;
    
    return {
      id: track.id,
      // 🛠️ FIX: Cast to satisfy strict unions
      type: track.type as "video" | "audio" | "text", 
      clips: track.clips.map((clip): AIClipSnapshot => ({
        id: clip.id,
        // 🛠️ FIX: Cast to satisfy strict unions
        type: clip.type as "video" | "audio" | "image" | "text", 
        startMs: clip.start_ms,
        durationMs: clip.duration_ms,
        sourceOffsetMs: clip.source_offset_ms || 0,
        // 🛠️ FIX: Fallback to strict string if null
        label: clip.label || "Untitled Clip", 
      })),
    };
  });

  // 2. Build the exact payload
  const snapshot: AIContextSnapshot = {
    project: {
      totalDurationMs: getTimelineDurationMs(timeline),
      trackCount: timeline.tracks.length,
      clipCount: totalClips,
    },
    tracks,
    selection: {
      selectedClipId: state.selectedClipId,
      selectedTrackId: state.selectedTrackId,
    },
    playback: {
      currentTimeMs: state.currentTimeMs,
      isPlaying: state.isPlaying,
    },
  };

  return snapshot;
}