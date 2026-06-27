import { useEffect, useRef } from "react";
import { saveTimeline } from "../api/timelineApi";
import { useEditorStore } from "../store/editorStore";

export function useTimelineAutosave(projectId: string | null) {
  const timeline = useEditorStore((s) => s.timeline);
  const isDirty = useEditorStore((s) => s.isDirty);
  const isSaving = useEditorStore((s) => s.isSaving);
  const markSaving = useEditorStore((s) => s.markSaving);
  const markSaved = useEditorStore((s) => s.markSaved);
  const setTimeline = useEditorStore((s) => s.setTimeline);
  
  // --- THE CLOUD LOCK ---
  const hasHydratedFromCloud = useEditorStore((s) => s.hasHydratedFromCloud);

  const timelineRef = useRef(timeline);
  useEffect(() => { timelineRef.current = timeline; }, [timeline]);

  useEffect(() => {
    // THE SHIELD: Do absolutely nothing until Rust has handed over the timeline!
    if (!projectId || !timeline || !isDirty || isSaving || !hasHydratedFromCloud) return;

    const timer = window.setTimeout(async () => {
      try {
        markSaving();
        const res = await saveTimeline(projectId, timelineRef.current!);
        setTimeline(res.timeline, false);
        markSaved();
      } catch (err) {
        console.error("Autosave failed", err);
        // CRITICAL FIX: Unlock the saving state if the network request fails!
        useEditorStore.setState({ isSaving: false }); 
      }
    }, 800);

    return () => window.clearTimeout(timer);
  }, [timeline, isDirty, isSaving, markSaving, markSaved, projectId, setTimeline, hasHydratedFromCloud]);
}