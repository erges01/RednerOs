import type { TimelineDocument, Clip } from "../types/editor";

export interface ResolvedPreviewState {
  activeVisualClip: Clip | null;
  activeAudioClips: Clip[];
}

/**
 * Scans the timeline at a specific millisecond and determines exactly what 
 * should be seen on the screen and heard through the speakers.
 */
export const resolvePreviewState = (
  timeline: TimelineDocument | null,
  currentTimeMs: number
): ResolvedPreviewState => {
  if (!timeline) return { activeVisualClip: null, activeAudioClips: [] };

  let activeVisualClip: Clip | null = null;
  const activeAudioClips: Clip[] = [];

  // We loop through tracks. In video editing, tracks at the bottom of the list 
  // (higher index) usually render *on top* of earlier tracks.
  for (const track of timeline.tracks) {
    for (const clip of track.clips) {
      // Check if the current playhead is inside this clip's time range
      const isPlaying = currentTimeMs >= clip.start_ms && currentTimeMs < (clip.start_ms + clip.duration_ms);
      
      if (isPlaying) {
        if (clip.type === "video" || clip.type === "image") {
          // If multiple visual clips overlap, the one on the highest track overwrites the previous one.
          activeVisualClip = clip;
        } else if (clip.type === "audio") {
          // We collect all active audio clips so they can mix together
          activeAudioClips.push(clip);
        }
      }
    }
  }

  return { activeVisualClip, activeAudioClips };
};