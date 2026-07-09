// src/features/ai/types/commands.ts

// 1. The specific operations the AI is legally allowed to request
export type AIOperation =
  | { type: "DELETE_CLIP"; clipId: string }
  | { type: "SPLIT_CLIP"; clipId: string; timeMs: number }
  | { type: "SEEK"; timeMs: number }
  | { type: "PLAY_PAUSE" };

// 2. The exact JSON payload we will instruct the LLM to return
export interface AIResponsePayload {
  thoughts: string; // The AI explains why it is making this edit
  operations: AIOperation[]; // The actual array of commands
}