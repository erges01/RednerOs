import type { TimelineDocument } from "../types/editor";

/**
 * Scans the entire timeline to find the absolute end time of the last clip.
 * This determines the total duration of your composition.
 */
export const getTimelineDurationMs = (timeline: TimelineDocument | null): number => {
  if (!timeline || timeline.tracks.length === 0) return 0;
  
  let maxDurationMs = 0;

  for (const track of timeline.tracks) {
    for (const clip of track.clips) {
      const clipEndTime = clip.start_ms + clip.duration_ms;
      if (clipEndTime > maxDurationMs) {
        maxDurationMs = clipEndTime;
      }
    }
  }

  // Add a 2-second buffer at the end so the video doesn't instantly snap to a hard stop
  return maxDurationMs > 0 ? maxDurationMs + 2000 : 0; 
};