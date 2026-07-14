// src/features/intelligence/planning/blueprintGenerator.ts

import type { CreativeIntent } from "../interview/interviewTypes";
import type {
  ProjectBlueprint,
  NarrativePlan,
  ScenePlan,
  AssetRequirement,
} from "./planningTypes";

/**
 * Maps the vague length intent to a concrete millisecond target.
 */
function calculateTargetDuration(intent: CreativeIntent): number {
  switch (intent.targetDuration) {
    case "short": return 45 * 1000; // 45 seconds
    case "medium": return 3 * 60 * 1000; // 3 minutes
    case "long": return 10 * 60 * 1000; // 10 minutes
    default: return 60 * 1000; // 1 min fallback
  }
}

/**
 * Determines the narrative framework based on the user's primary goal.
 */
function buildNarrativePlan(intent: CreativeIntent): NarrativePlan {
  if (intent.goal === "educate") {
    return {
      structureType: "Hook -> Concept -> Examples -> Summary -> CTA",
      summary: `An educational breakdown explaining ${intent.topic || "the core concept"} to a ${intent.audience || "general"} audience.`,
    };
  }
  
  if (intent.goal === "entertain") {
    return {
      structureType: "Hook -> Build-up -> Climax -> Resolution",
      summary: `A high-energy, fast-paced video about ${intent.topic || "the subject"} designed to maximize retention.`,
    };
  }
  
  return {
    structureType: "Hook -> Problem -> Solution -> CTA",
    summary: `A standard conversion-focused video about ${intent.topic || "the subject"}.`,
  };
}

/**
 * The core engine that converts an Intent into a full Project Blueprint.
 */
export function generateBlueprint(intent: CreativeIntent): ProjectBlueprint {
  const targetDurationMs = calculateTargetDuration(intent);
  const narrative = buildNarrativePlan(intent);
  
  // Define required assets for the checklist
  const voiceAssetId = crypto.randomUUID();
  const bRollAssetId = crypto.randomUUID();

  const assetChecklist: AssetRequirement[] = [
    {
      id: voiceAssetId,
      type: "voice",
      description: "Primary creator voice narration",
      isRequired: true,
    },
    {
      id: bRollAssetId,
      type: "video",
      description: `B-roll footage illustrating ${intent.topic || "the topic"}`,
      isRequired: false,
    }
  ];

  // Mathematically allocate scene durations based on total target duration
  const hookDuration = Math.min(5000, targetDurationMs * 0.1); // Max 5s hook
  const outroDuration = Math.min(10000, targetDurationMs * 0.1); // Max 10s outro
  const bodyDuration = targetDurationMs - hookDuration - outroDuration;

  // Scaffold the specific scenes
  const scenes: ScenePlan[] = [
    {
      id: crypto.randomUUID(),
      order: 0,
      purpose: "hook",
      durationMs: hookDuration,
      narration: "[AI Script Writer will generate the hook here]",
      visual: {
        camera: "close_up",
        setting: "Studio",
        emotion: intent.tone === "energetic" ? "high energy" : "engaging",
      },
      transitionOut: "whip",
      assetsNeeded: [voiceAssetId],
    },
    {
      id: crypto.randomUUID(),
      order: 1,
      purpose: "body",
      durationMs: bodyDuration,
      narration: "[AI Script Writer will generate the main content here]",
      visual: {
        camera: "medium",
        setting: "Studio",
        emotion: "confident",
      },
      transitionOut: "fade",
      assetsNeeded: [voiceAssetId, bRollAssetId],
    },
    {
      id: crypto.randomUUID(),
      order: 2,
      purpose: "outro",
      durationMs: outroDuration,
      narration: "[AI Script Writer will generate the Call to Action here]",
      visual: {
        camera: "wide",
        setting: "Studio",
        emotion: "friendly",
      },
      transitionOut: "cut",
      assetsNeeded: [voiceAssetId],
    }
  ];

  return {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    intent,
    narrative,
    assetChecklist,
    scenes,
    estimatedDurationMs: targetDurationMs,
  };
}