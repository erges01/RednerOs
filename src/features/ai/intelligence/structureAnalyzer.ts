// src/features/ai/intelligence/structureAnalyzer.ts
import type { TimelineDocument } from "../../workspace/types/editor";
import type { EditorCommand } from "../../workspace/store/editorCommands";

export interface StructuralIssue {
  id: string;
  type: "WEAK_HOOK" | "ABRUPT_OUTRO";
  description: string;
  timeMs: number;
  suggestedCommand?: EditorCommand;
}

export function analyzeStructure(timeline: TimelineDocument): StructuralIssue[] {
  const issues: StructuralIssue[] = [];
  const HOOK_DURATION_MS = 5000; // First 5 seconds is the hook zone
  
  const mainTrack = timeline.tracks[0];
  if (!mainTrack || mainTrack.clips.length === 0) return issues;

  const sortedClips = [...mainTrack.clips].sort((a, b) => a.start_ms - b.start_ms);

  // 1. Hook Analysis: Does the first clip drag through the whole hook zone?
  const firstClip = sortedClips[0];
  // If the first clip starts at 0 and has no cuts for 5+ seconds, it's visually boring.
  if (firstClip.start_ms === 0 && firstClip.duration_ms >= HOOK_DURATION_MS) {
    issues.push({
      id: crypto.randomUUID(),
      type: "WEAK_HOOK",
      description: "Hook is visually static. Split the clip around 3s or add B-roll to reset audience attention.",
      timeMs: 3000,
      // Suggest jumping to 3s so the user can hit 'Split'
      suggestedCommand: { type: "SEEK", payload: { timeMs: 3000 } }
    });
  }

  // 2. Outro Analysis: Does the video end too abruptly?
  const lastClip = sortedClips[sortedClips.length - 1];
  if (lastClip.duration_ms < 1500) { // Less than 1.5s is a jump-scare ending
    issues.push({
      id: crypto.randomUUID(),
      type: "ABRUPT_OUTRO",
      description: "Video ends abruptly (< 1.5s final clip). Consider extending or adding an outro text block.",
      timeMs: lastClip.start_ms,
      suggestedCommand: { type: "SEEK", payload: { timeMs: lastClip.start_ms } }
    });
  }

  return issues;
}