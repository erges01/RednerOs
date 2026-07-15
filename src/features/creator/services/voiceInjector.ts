// src/features/creator/services/voiceInjector.ts

import { v4 as uuidv4 } from "uuid";
import { generateSpeechForPersona } from "./voiceEngine";
import { useProjectStore } from "../../../stores/projectStore";
import { useEditorStore } from "../../workspace/store/editorStore";
import type { Clip } from "../../workspace/types/editor";

/**
 * Takes AI-generated text, generates persona-specific speech, 
 * saves it as an asset, and drops it onto the timeline.
 */
export async function generateAndInjectVoiceover(text: string, startTimeMs: number) {
  console.log(`[Voice Injector] Starting voice generation for timeline...`);
  
  // 1. Generate the audio via our Persona-Aware Voice Engine
  const { url, duration_ms } = await generateSpeechForPersona(text);

  const { currentProject } = useProjectStore.getState();
  const { timeline } = useEditorStore.getState();

  if (!currentProject || !timeline) {
    console.error("[Voice Injector] No active project or timeline found.");
    return;
  }

  // 2. Find the Audio track (or default to the second track)
  const audioTrack = timeline.tracks.find(t => t.type === "audio") || timeline.tracks[1];
  
  if (!audioTrack) {
    console.error("[Voice Injector] No audio track available to drop the voiceover.");
    return;
  }

  // 3. Create a strictly-typed new "Asset" for the Asset Bin
  const newAssetId = uuidv4();
  const newAsset = {
    id: newAssetId,
    project_id: currentProject.id,
    type: "audio" as const,
    name: `Voiceover - ${text.substring(0, 15)}...`,
    url: url,
    size: 1024 * 500, // mock size (500kb)
    createdAt: Date.now().toString(),
    vaultKey: "local-mock-vault",
    metadata: {
      duration_ms
    }
  };

  // Temporarily force it into the project store's asset list
  useProjectStore.setState((state) => {
    if (!state.currentProject) return state;
    return {
      currentProject: {
        ...state.currentProject,
        assets: [...state.currentProject.assets, newAsset]
      }
    };
  });

  // 4. Create the actual Clip object for the Timeline
  const voiceClip: Clip = {
    id: uuidv4(),
    track_id: audioTrack.id,
    type: "audio",
    start_ms: startTimeMs,
    duration_ms: duration_ms,
    asset_id: newAssetId,
    label: "AI Voiceover",
    color: "#d7ba7d", // Gold for audio
    source_offset_ms: 0,
  };

  // 5. Inject it directly into the correct Track in the Redner Timeline state
  useEditorStore.setState((state) => {
    if (!state.timeline) return state;
    return {
      timeline: {
        ...state.timeline,
        tracks: state.timeline.tracks.map((track) => {
          // If this is the track we targeted, push the new clip into it
          if (track.id === audioTrack.id) {
            return {
              ...track,
              clips: [...track.clips, voiceClip]
            };
          }
          return track;
        })
      }
    };
  });

  console.log(`[Voice Injector] ✔ Successfully injected voiceover at ${startTimeMs}ms`);
}