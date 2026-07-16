// src/features/performance/types/performance.ts

export type EnergyLevel = "low" | "medium" | "high" | "dynamic";
export type ExpressionPreset = "neutral" | "happy" | "thinking" | "serious" | "confident" | "curious";
export type GestureStyle = "minimal" | "teacher" | "podcast" | "keynote" | "energetic" | "calm";
export type CameraFraming = "close-up" | "medium" | "wide" | "over-the-shoulder" | "dynamic-push";

export interface SpeakingStyle {
  pace: number; // 0.5 (slow) to 2.0 (fast)
  confidence: EnergyLevel;
  pauseLength: "short" | "medium" | "dramatic";
}

export interface PerformanceProfile {
  id: string;
  name: string; // e.g., "High-Energy Tutorial", "Chill Podcast Vibe"
  energy: EnergyLevel;
  speakingStyle: SpeakingStyle;
  defaultExpression: ExpressionPreset;
  gestureStyle: GestureStyle;
  eyeContactLevel: number; // 0 to 100%
  preferredCamera: CameraFraming;
}