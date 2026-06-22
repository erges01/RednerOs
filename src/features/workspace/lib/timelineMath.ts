import type { Clip, TimelineDocument } from "../types/editor";

export const MIN_CLIP_DURATION_MS = 200;
export const BASE_PIXELS_PER_SECOND = 120;

export function getPixelsPerSecond(zoom: number) {
  return BASE_PIXELS_PER_SECOND * zoom;
}

export function msToPx(ms: number, zoom: number) {
  return (ms / 1000) * getPixelsPerSecond(zoom);
}

export function pxToMs(px: number, zoom: number) {
  return Math.round((px / getPixelsPerSecond(zoom)) * 1000);
}

export function cloneTimeline(timeline: TimelineDocument): TimelineDocument {
  return JSON.parse(JSON.stringify(timeline));
}

export function updateClipInTimeline(
  timeline: TimelineDocument,
  trackId: string,
  clipId: string,
  updater: (clip: Clip) => Clip
): TimelineDocument {
  const next = cloneTimeline(timeline);
  next.tracks = next.tracks.map((track) => {
    if (track.id !== trackId) return track;
    return {
      ...track,
      clips: track.clips.map((clip) => (clip.id === clipId ? updater(clip) : clip)),
    };
  });
  return next;
}