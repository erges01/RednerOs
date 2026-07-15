// src/features/creator/services/voiceEngine.ts

import { useCreatorStore } from "../store/creatorStore";
import { v4 as uuidv4 } from "uuid";

/**
 * Simulates calling a TTS provider (like ElevenLabs) to generate speech.
 * Returns a mock URL that would normally be a blob/URL from the API.
 */
export async function generateSpeechForPersona(text: string): Promise<{ url: string; duration_ms: number }> {
  const { creator, personas, voiceProfiles } = useCreatorStore.getState();
  
  if (!creator || !creator.activePersonaId) {
    throw new Error("No active persona found. Cannot generate voice.");
  }

  const activePersona = personas.find(p => p.id === creator.activePersonaId);
  
  // Try to find the specific voice profile attached to this persona, or fallback to the first one in the store
  const targetVoiceId = activePersona?.voiceProfileId || "voice-1";
  const voiceProfile = voiceProfiles.find(v => v.id === targetVoiceId);
  
  console.log(`[Voice Engine] Persona: ${activePersona?.name}`);
  console.log(`[Voice Engine] Using Voice Profile: ${voiceProfile?.name} (Provider: ${voiceProfile?.provider})`);
  console.log(`[Voice Engine] Text: "${text.substring(0, 30)}..."`);
  // Simulate API latency (e.g., waiting for ElevenLabs)
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simulate audio duration based on word count
  const wordCount = text.split(" ").length;
  const estimatedDurationMs = (wordCount / 150) * 60 * 1000;

  return {
    url: `blob:mock-audio-url-${uuidv4()}`,
    duration_ms: estimatedDurationMs
  };
}