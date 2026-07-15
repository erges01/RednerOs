// src/features/creator/store/creatorStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Creator, Persona, CreatorPreferences } from "../types/creator";
import type { VoiceProfile, BrandProfile, FaceProfile } from "../types/identity";

interface CreatorStoreState {
  creator: Creator | null;
  personas: Persona[];
  preferences: CreatorPreferences;
  
  // Identity Graph Data
  voiceProfiles: VoiceProfile[];
  brandProfiles: BrandProfile[];
  faceProfiles: FaceProfile[];

  // Core Actions
  setCreator: (creator: Creator) => void;
  addPersona: (persona: Persona) => void;
  switchPersona: (personaId: string) => void;
  updatePreferences: (prefs: Partial<CreatorPreferences>) => void;
  
  // Graph Actions
  addVoiceProfile: (voice: VoiceProfile) => void;
  addBrandProfile: (brand: BrandProfile) => void;
  addFaceProfile: (face: FaceProfile) => void;
}

export const useCreatorStore = create<CreatorStoreState>()(
  persist(
    (set) => ({
      creator: null,
      personas: [],
      preferences: {
        theme: "dark",
        autosave: true,
        defaultLanguage: "en-US",
      },
      
      // Default out-of-the-box profiles
      voiceProfiles: [
        {
          id: "voice-1",
          name: "Default Tech Explainer",
          provider: "local",
          voiceId: "mock-voice-id",
          settings: { speed: 1.0, pitch: 1.0, stability: 0.8, similarity: 0.75 }
        }
      ],
      brandProfiles: [
        {
          id: "brand-1",
          name: "Dark Mode Dev",
          colors: { primary: "#007acc", secondary: "#4ec9b0", accent: "#d7ba7d", background: "#1e1e1e" },
          typography: { headingFont: "Inter", bodyFont: "Fira Code" },
          defaultBrollKeywords: ["coding", "rust programming", "terminal", "server architecture"]
        }
      ],
      faceProfiles: [],

      setCreator: (creator) => set({ creator }),
      
      addPersona: (persona) => set((state) => ({ 
        personas: [...state.personas, persona] 
      })),

      switchPersona: (personaId) => set((state) => ({
        creator: state.creator ? { ...state.creator, activePersonaId: personaId } : null
      })),

      updatePreferences: (prefs) => set((state) => ({
        preferences: { ...state.preferences, ...prefs }
      })),

      addVoiceProfile: (voice) => set((state) => ({
        voiceProfiles: [...state.voiceProfiles, voice]
      })),
      
      addBrandProfile: (brand) => set((state) => ({
        brandProfiles: [...state.brandProfiles, brand]
      })),
      
      addFaceProfile: (face) => set((state) => ({
        faceProfiles: [...state.faceProfiles, face]
      }))
    }),
    { name: "redner-creator-storage" }
  )
);