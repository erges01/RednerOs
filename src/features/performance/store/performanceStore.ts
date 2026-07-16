// src/features/performance/store/performanceStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PerformanceProfile } from "../types/performance";
import { v4 as uuidv4 } from "uuid";

interface PerformanceStoreState {
  profiles: PerformanceProfile[];
  activeProfileId: string | null;

  // Actions
  addProfile: (profile: Omit<PerformanceProfile, "id">) => void;
  setActiveProfile: (id: string) => void;
  updateProfile: (id: string, updates: Partial<PerformanceProfile>) => void;
}

export const usePerformanceStore = create<PerformanceStoreState>()(
  persist(
    (set) => ({
      profiles: [
        {
          id: "perf-default-1",
          name: "Standard Developer Tutorial",
          energy: "medium",
          speakingStyle: {
            pace: 1.1,
            confidence: "high",
            pauseLength: "medium",
          },
          defaultExpression: "confident",
          gestureStyle: "teacher",
          eyeContactLevel: 90,
          preferredCamera: "medium",
        }
      ],
      activeProfileId: "perf-default-1",

      addProfile: (profile) => 
        set((state) => ({
          profiles: [...state.profiles, { ...profile, id: uuidv4() }]
        })),

      setActiveProfile: (id) => 
        set({ activeProfileId: id }),

      updateProfile: (id, updates) =>
        set((state) => ({
          profiles: state.profiles.map((p) => 
            p.id === id ? { ...p, ...updates } : p
          )
        })),
    }),
    { name: "redner-performance-storage" }
  )
);