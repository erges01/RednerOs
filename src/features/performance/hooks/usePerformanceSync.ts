import { useEffect, useRef } from "react";
import { useEditorStore } from "../../workspace/store/editorStore";
import { usePerformanceStore } from "../store/performanceStore";
import type { Track } from "../../workspace/types/editor";

export const usePerformanceSync = () => {
  const { timeline, currentTimeMs } = useEditorStore();
  const { profiles, activeProfileId, updateProfile } = usePerformanceStore();
  
  // Track the last processed clip ID to prevent infinite state updates
  const lastActiveClipId = useRef<string | null>(null);

  useEffect(() => {
    if (!timeline) return;

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
      
      // Update the active profile with the settings from the clip
      if (activeProfileId) {
        updateProfile(activeProfileId, {
          energy: settings.energy,
          defaultExpression: settings.expression,
          eyeContactLevel: settings.eyeContact,
          gestureStyle: settings.gesture,
          preferredCamera: settings.camera,
          speakingStyle: { pace: settings.pace }
        });
        
        console.log("🎬 Sync: Performance state updated to:", settings);
      }
    } 
    // If we left a clip (playhead is in empty space), reset to a default or keep state? 
    // We'll keep state for now to avoid flickering, but we reset the ID tracker
    else if (!activeClip) {
      lastActiveClipId.current = null;
    }

  }, [currentTimeMs, timeline, activeProfileId, updateProfile]);
};