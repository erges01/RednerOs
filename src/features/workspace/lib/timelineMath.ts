import type { Clip, TimelineDocument } from "../types/editor";

export const MIN_CLIP_DURATION_MS = 200;
export const BASE_PIXELS_PER_SECOND = 120;
// --- NEW: The Magnetic Field Radius ---
export const SNAP_THRESHOLD_MS = 150; 

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

// ==========================================
// --- NEW: MAGNETIC SNAPPING PHYSICS ---
// ==========================================

export function getTimelineSnapPoints(timeline: TimelineDocument, ignoreClipId: string): number[] {
  const points = new Set<number>();
  points.add(0); // Always snap to the absolute beginning of the video
  
  for (const track of timeline.tracks) {
    for (const clip of track.clips) {
      if (clip.id === ignoreClipId) continue; // Don't let a clip snap to itself!
      points.add(clip.start_ms);
      points.add(clip.start_ms + clip.duration_ms);
    }
  }
  return Array.from(points);
}

// For Resizing: Snaps a single edge
export function calculateSnapPoint(timeMs: number, snapPoints: number[]): number {
  let snapped = timeMs;
  let minDelta = SNAP_THRESHOLD_MS;
  
  for (const point of snapPoints) {
    const delta = Math.abs(timeMs - point);
    if (delta < minDelta) {
      minDelta = delta;
      snapped = point;
    }
  }
  return snapped;
}

// For Moving: Checks BOTH the left and right edges of the clip
export function calculateClipMoveSnap(startMs: number, durationMs: number, snapPoints: number[]): number {
  let snappedStart = startMs;
  let minDelta = SNAP_THRESHOLD_MS;
  const endMs = startMs + durationMs;

  for (const point of snapPoints) {
    // 1. Test if the LEFT edge is near a snap point
    const startDelta = Math.abs(startMs - point);
    if (startDelta < minDelta) {
      minDelta = startDelta;
      snappedStart = point;
    }
    
    // 2. Test if the RIGHT edge is near a snap point
    const endDelta = Math.abs(endMs - point);
    if (endDelta < minDelta) {
      minDelta = endDelta;
      snappedStart = point - durationMs; // Shift the start time so the end is perfectly flush
    }
  }
  
  return Math.max(0, snappedStart);
}