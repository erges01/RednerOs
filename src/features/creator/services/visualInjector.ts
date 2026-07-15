// src/features/creator/services/visualInjector.ts

import { v4 as uuidv4 } from "uuid";
import { useCreatorStore } from "../store/creatorStore";
import { useProjectStore } from "../../../stores/projectStore";
import { useEditorStore } from "../../workspace/store/editorStore";
import type { Clip } from "../../workspace/types/editor";

/**
 * Simulates generating or pulling a B-roll video clip based on the 
 * Persona's Brand keywords or Face profile.
 */
export async function injectVisualBroll(sceneKeyword: string, startTimeMs: number) {
  console.log(`[Visual Engine] Sourcing B-Roll for keyword: "${sceneKeyword}"...`);

  const { creator, personas, brandProfiles } = useCreatorStore.getState();
  const { currentProject } = useProjectStore.getState();
  const { timeline } = useEditorStore.getState();

  if (!currentProject || !timeline) {
    console.error("[Visual Engine] No active project or timeline found.");
    return;
  }

  // 1. Look up the Persona's Visual Style
  let activeBrand = brandProfiles[0];
  if (creator?.activePersonaId) {
    const activePersona = personas.find(p => p.id === creator.activePersonaId);
    if (activePersona?.brandProfileId) {
      const foundBrand = brandProfiles.find(b => b.id === activePersona.brandProfileId);
      if (foundBrand) activeBrand = foundBrand;
    }
  }

  // 2. Enhance the search query using the Creator's default keywords
  const searchKeywords = [...activeBrand.defaultBrollKeywords, sceneKeyword].join(", ");
  console.log(`[Visual Engine] Enhanced Search Query: [${searchKeywords}]`);

  // Simulate API delay (e.g., searching an asset library or generating via Runway/Sora)
  await new Promise(resolve => setTimeout(resolve, 1200));

  // 3. Create the Asset
  const newAssetId = uuidv4();
  const durationMs = 4000; // Default 4 second B-roll clip

  const newAsset = {
    id: newAssetId,
    project_id: currentProject.id,
    type: "video" as const,
    name: `B-Roll: ${sceneKeyword}`,
    url: `https://mock-video-storage.local/${newAssetId}.mp4`,
    size: 1024 * 5000, // 5MB mock size
    createdAt: new Date().toISOString(),
    vaultKey: `vault_${newAssetId}`,
    metadata: {
      duration_ms: durationMs,
      resolution: "1080p",
      fps: 60
    }
  };

  // Add to Project Store
  useProjectStore.setState((state) => {
    if (!state.currentProject) return state;
    return {
      currentProject: {
        ...state.currentProject,
        assets: [...state.currentProject.assets, newAsset]
      }
    };
  });

  // 4. Find the Video Track
  const videoTrack = timeline.tracks.find(t => t.type === "video") || timeline.tracks[0];

  // 5. Create the Clip
  const videoClip: Clip = {
    id: uuidv4(),
    track_id: videoTrack.id,
    type: "video",
    start_ms: startTimeMs,
    duration_ms: durationMs,
    asset_id: newAssetId,
    label: `🎬 ${sceneKeyword}`,
    color: "#4e94ce", // Standard Video Blue
    source_offset_ms: 0,
  };

  // 6. Inject into Timeline
  useEditorStore.setState((state) => {
    if (!state.timeline) return state;
    return {
      timeline: {
        ...state.timeline,
        tracks: state.timeline.tracks.map((track) => {
          if (track.id === videoTrack.id) {
            return {
              ...track,
              clips: [...track.clips, videoClip]
            };
          }
          return track;
        })
      }
    };
  });

  console.log(`[Visual Engine] ✔ Successfully injected B-Roll at ${startTimeMs}ms`);
}
