// src/features/creator/services/brandInjector.ts

import { v4 as uuidv4 } from "uuid";
import { useCreatorStore } from "../store/creatorStore";
import { useEditorStore } from "../../workspace/store/editorStore";

/**
 * Takes a raw string, applies the active Persona's Brand Profile 
 * (colors, fonts), and drops a styled text clip onto the timeline.
 */
export function injectBrandedTextClip(text: string, startTimeMs: number, durationMs: number = 3000) {
  console.log(`[Brand Engine] Generating branded text clip...`);

  const { creator, personas, brandProfiles } = useCreatorStore.getState();
  const { timeline } = useEditorStore.getState();

  if (!timeline) {
    console.error("[Brand Engine] No active timeline found.");
    return;
  }

  // 1. Look up the Active Brand Profile
  let activeBrand = brandProfiles[0]; // Fallback to our default "Dark Mode Dev"
  if (creator?.activePersonaId) {
    const activePersona = personas.find(p => p.id === creator.activePersonaId);
    if (activePersona?.brandProfileId) {
      const foundBrand = brandProfiles.find(b => b.id === activePersona.brandProfileId);
      if (foundBrand) activeBrand = foundBrand;
    }
  }

  console.log(`[Brand Engine] Applied Brand: ${activeBrand.name}`);
  console.log(`[Brand Engine] Using Primary Color: ${activeBrand.colors.primary}, Font: ${activeBrand.typography.headingFont}`);

  // 2. Find the top track to place the text (usually Video Track 1)
  const videoTrack = timeline.tracks.find(t => t.type === "video") || timeline.tracks[0];
  
  if (!videoTrack) {
    console.error("[Brand Engine] No suitable track found to drop text.");
    return;
  }

  // 3. Create the Branded Text Clip
  // We apply the brand's primary color to the UI clip itself, and tuck the typography into the metadata!
  const textClip = {
    id: uuidv4(),
    track_id: videoTrack.id,
    type: "text", // Custom type for rendering
    start_ms: startTimeMs,
    duration_ms: durationMs,
    asset_id: "system-text", // Text doesn't need an external file asset
    label: text,
    color: activeBrand.colors.primary, // IDE Timeline block color matches the Brand!
    source_offset_ms: 0,
    metadata: {
      text: text,
      fontFamily: activeBrand.typography.headingFont,
      textColor: activeBrand.colors.accent,
      backgroundColor: activeBrand.colors.background,
    }
  } as any; // Cast as any temporarily if your strictly-typed Clip interface doesn't have 'text' yet

  // 4. Inject into the Timeline State
  useEditorStore.setState((state) => {
    if (!state.timeline) return state;
    return {
      timeline: {
        ...state.timeline,
        tracks: state.timeline.tracks.map((track) => {
          if (track.id === videoTrack.id) {
            return {
              ...track,
              clips: [...track.clips, textClip]
            };
          }
          return track;
        })
      }
    };
  });

  console.log(`[Brand Engine] ✔ Successfully injected branded title at ${startTimeMs}ms`);
}