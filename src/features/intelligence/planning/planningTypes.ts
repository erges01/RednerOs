// src/features/intelligence/planning/planningTypes.ts

import type { CreativeIntent } from "../interview/interviewTypes";

export type ScenePurpose = "hook" | "intro" | "body" | "b-roll" | "outro" | "transition";
export type CameraAngle = "wide" | "medium" | "close_up" | "screen_record" | "none";
export type TransitionType = "cut" | "fade" | "whip" | "zoom";

export interface AssetRequirement {
  id: string;
  type: "video" | "audio" | "image" | "overlay" | "voice";
  description: string;
  isRequired: boolean;
}

export interface ScenePlan {
  id: string;
  order: number;
  purpose: ScenePurpose;
  durationMs: number;
  narration: string; // The script to be spoken
  visual: {
    camera: CameraAngle;
    setting: string;
    emotion: string; // e.g., "high energy", "serious"
  };
  transitionOut: TransitionType;
  assetsNeeded: string[]; // References AssetRequirement IDs
}

export interface NarrativePlan {
  structureType: string; // e.g., "Hook-Problem-Solution"
  summary: string;
}

export interface ProjectBlueprint {
  id: string;
  createdAt: number;
  intent: CreativeIntent;
  narrative: NarrativePlan;
  assetChecklist: AssetRequirement[];
  scenes: ScenePlan[];
  estimatedDurationMs: number;
}