import { useEffect, useRef } from "react";
import { useEditorStore } from "../../workspace/store/editorStore";
import { usePerformanceStore } from "../store/performanceStore";
import type { Track } from "../../workspace/types/editor";

export const usePerformanceSync = () => {
  const { timeline, currentTimeMs } = useEditorStore();
  const { profiles, activeProfileId, updateProfile } = usePerformanceStore(); // ✅ profiles is now used
  
  // Track the last processed clip ID to prevent infinite state updates
  const lastActiveClipId = useRef<string | null>(null);

  useEffect(() => {
    if (!timeline || !activeProfileId) return;

    // 1. Find the Performance Track
    const perfTrack = timeline.tracks.find((t: Track) => t.type === "performance");
    if (!perfTrack) return;

    // 2. Find if the playhead is currently inside a performance clip
    const activeClip = perfTrack.clips.find(
      (c) => currentTimeMs >= c.start_ms && currentTimeMs < c.start_ms + c.duration_ms
    );

    // 3. If we are in a clip and it's different from the last one we processed
    if (activeClip && activeClip.id !== lastActiveClipId.current && activeClip.metadata?.settings) {
      lastActiveClipId.current = activeClip.id;

      // Update the performance store to match the clip's baked-in settings
      const settings = activeClip.metadata.settings;
      const currentProfile = profiles.find(p => p.id === activeProfileId);

      // ✅ Ensure we have the current profile so we can spread the missing SpeakingStyle properties
      if (currentProfile) {
        updateProfile(activeProfileId, {
          energy: settings.energy,
          defaultExpression: settings.expression,
          eyeContactLevel: settings.eyeContact,
          gestureStyle: settings.gesture,
          preferredCamera: settings.camera,
          speakingStyle: { 
            ...currentProfile.speakingStyle, // Keeps confidence and pauseLength intact
            pace: settings.pace 
          }
        });
        
        console.log("🎬 Sync: Performance state updated to:", settings);
      }
    } 
    // If we left a clip (playhead is in empty space), reset the ID tracker
    else if (!activeClip) {
      lastActiveClipId.current = null;
    }

  }, [currentTimeMs, timeline, activeProfileId, updateProfile, profiles]);
};