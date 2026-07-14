// src/features/intelligence/interview/memoryStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CreatorMemory } from "./memoryTypes";
import type { CreativeIntent } from "./interviewTypes";

interface MemoryState {
  memory: CreatorMemory;
  updateMemoryFromIntent: (intent: CreativeIntent) => void;
  clearMemory: () => void;
}

export const useCreatorMemoryStore = create<MemoryState>()(
  persist(
    (set) => ({
      memory: {},
      
      // Automatically extracts reusable preferences from a completed interview
      updateMemoryFromIntent: (intent) => set((state) => ({
        memory: {
          ...state.memory,
          ...(intent.platform && { preferredPlatform: intent.platform }),
          ...(intent.targetDuration && { preferredLength: intent.targetDuration }),
          ...(intent.audience && { preferredAudience: intent.audience }),
          ...(intent.tone && { preferredTone: intent.tone }),
        }
      })),
      
      clearMemory: () => set({ memory: {} }),
    }),
    {
      name: "redner-creator-memory", // Persists across browser refreshes
    }
  )
);