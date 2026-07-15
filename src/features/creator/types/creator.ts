// src/features/creator/types/creator.ts

export type CreatorID = string;
export type PersonaID = string;

export interface Creator {
  id: CreatorID;
  displayName: string;
  email: string;
  createdAt: number;
  // References
  activePersonaId: PersonaID | null;
  personaIds: PersonaID[];
}

export interface Persona {
  id: PersonaID;
  creatorId: CreatorID;
  name: string; // e.g., "Devyy Tech", "Devyy Shorts"
  avatarUrl?: string;
  description: string;
  
  // Identity References (To be filled in Phases 4.2 - 4.5)
  voiceProfileId?: string;
  faceProfileId?: string;
  brandProfileId?: string;
  
  // AI Persona Settings
  systemPrompt: string; // The core instruction for this persona
  tone: "casual" | "professional" | "energetic" | "sarcastic";
}

export interface CreatorPreferences {
  theme: "dark" | "light";
  autosave: boolean;
  defaultLanguage: string;
}