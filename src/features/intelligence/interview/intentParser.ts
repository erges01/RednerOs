// src/features/intelligence/interview/intentParser.ts

import type { CreativeIntent } from "./interviewTypes";
import type { CreatorMemory } from "./memoryTypes";

/**
 * Merges the active interview session intent with the user's historical memory.
 * Explicit answers from the current interview always override historical memory.
 */
export function buildFinalIntent(
  sessionIntent: CreativeIntent,
  memory: CreatorMemory
): CreativeIntent {
  return {
    topic: sessionIntent.topic,
    goal: sessionIntent.goal,
    
    // Fallbacks: If they skipped the question or we didn't ask it, pull from memory
    platform: sessionIntent.platform || memory.preferredPlatform,
    targetDuration: sessionIntent.targetDuration || memory.preferredLength,
    audience: sessionIntent.audience || memory.preferredAudience,
    tone: sessionIntent.tone || memory.preferredTone,
  };
}