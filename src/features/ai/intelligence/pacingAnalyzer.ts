// src/features/ai/intelligence/pacingAnalyzer.ts

import type { EditorCommand } from "../../workspace/store/editorCommands";
// 🛠️ FIX: Using your ACTUAL Redner Studio types
import type { TimelineDocument } from "../../workspace/types/editor";

export interface PacingIssue {
  id: string;
  type: "DEAD_AIR" | "LONG_CLIP";
  description: string;
  timeMs: number;
  suggestedCommand?: EditorCommand;
}

export function analyzePacing(timeline: TimelineDocument): PacingIssue[] {
  const issues: PacingIssue[] = [];
  const MAX_CLIP_LENGTH_MS = 15000; // 15 seconds without a cut is dragging
  const MAX_GAP_MS = 500; // Anything more than 0.5s gap is dead air

  // Let's assume Track 0 is our main narrative/video track
  const mainTrack = timeline.tracks[0];
  if (!mainTrack || mainTrack.clips.length === 0) return issues;

  // Sort clips by start time to read them left to right
  const sortedClips = [...mainTrack.clips].sort((a, b) => a.start_ms - b.start_ms);

  for (let i = 0; i < sortedClips.length; i++) {
    const currentClip = sortedClips[i];
    const currentEndMs = currentClip.start_ms + currentClip.duration_ms;

    // 1. Check for Dragging Clips (Too long)
    if (currentClip.duration_ms > MAX_CLIP_LENGTH_MS) {
      issues.push({
        id: crypto.randomUUID(),
        type: "LONG_CLIP",
        description: `Clip is ${Math.round(currentClip.duration_ms / 1000)}s long. Consider splitting or adding B-Roll.`,
        timeMs: currentClip.start_ms + (currentClip.duration_ms / 2),
        // AI Suggests moving the playhead to the middle so you can cut it
        suggestedCommand: { type: "SEEK", payload: { timeMs: currentClip.start_ms + (currentClip.duration_ms / 2) } }
      });
    }

    // 2. Check for Dead Air (Gaps between this clip and the next one)
    if (i < sortedClips.length - 1) {
      const nextClip = sortedClips[i + 1];
      const gap = nextClip.start_ms - currentEndMs;

      if (gap > MAX_GAP_MS) {
        issues.push({
          id: crypto.randomUUID(),
          type: "DEAD_AIR",
          description: `Found a ${gap / 1000}s gap of dead air. This kills pacing.`,
          timeMs: currentEndMs,
          // AI Suggests moving the next clip backward to close the gap instantly
          suggestedCommand: { 
            type: "MOVE_CLIP", 
            payload: { newStartMs: currentEndMs } 
          }
        });
      }
    }
  }

  return issues;
}