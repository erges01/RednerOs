// src/features/creator/types/identity.ts

export type VoiceProvider = "elevenlabs" | "openai" | "local";

export interface VoiceProfile {
  id: string;
  name: string; // e.g., "Deep Cinematic", "Casual Explainer"
  provider: VoiceProvider;
  voiceId: string; // The external API ID (e.g., ElevenLabs Voice ID)
  settings: {
    speed: number;
    pitch: number;
    stability: number;
    similarity: number;
  };
}

export interface BrandProfile {
  id: string;
  name: string; // e.g., "Dark Mode Dev", "Tech Minimalist"
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  watermarkUrl?: string; // Logo overlay
  defaultBrollKeywords: string[]; // e.g., ["coding", "matrix", "cyberpunk", "server rack"]
}

export interface FaceProfile {
  id: string;
  name: string;
  avatarImageUrl: string; // Used for the UI dashboard
  trainingDataUrls: string[]; // S3/Backend URLs to images used to train a LoRA/Face model
  basePrompt: string; // The default prompt to generate this person (e.g., "A developer in a black hoodie, cinematic lighting")
}