// src/features/ai/types/commands.ts

export type AIOperation =
  | { type: "PLAY_PAUSE" }
  | { type: "SEEK"; timeMs: number }
  | { type: "DELETE_CLIP"; clipId: string }
  | { type: "SPLIT_CLIP"; clipId: string; timeMs: number }
  // 🛠️ NEW: The Expansion Pack Types
  | { type: "MOVE_CLIP"; clipId: string; newStartMs: number }
  | { type: "DUPLICATE_CLIP"; clipId: string }
  | { type: "CREATE_MARKER"; timeMs: number; label: string };

export interface AIResponsePayload {
  thoughts: string;
  operations: AIOperation[];
}