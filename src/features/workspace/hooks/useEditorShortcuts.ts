import { useEffect } from "react";
import { useEditorStore } from "../store/editorStore";

export function useEditorShortcuts() {
  const selectedClipId = useEditorStore((s) => s.selectedClipId);
  const selectedTrackId = useEditorStore((s) => s.selectedTrackId);
  const removeClip = useEditorStore((s) => s.removeClip);
  const togglePlayback = useEditorStore((s) => s.togglePlayback);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // THE SHIELD: Do not trigger shortcuts if the user is typing inside an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // 1. Play / Pause
      if (e.code === "Space") {
        e.preventDefault(); // Stop the browser from scrolling down the page!
        togglePlayback();
      }

      // 2. Delete Active Clip
      if (e.code === "Backspace" || e.code === "Delete") {
        if (selectedClipId && selectedTrackId) {
          e.preventDefault();
          removeClip(selectedTrackId, selectedClipId);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    
    // Cleanup the listener when the workspace closes
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedClipId, selectedTrackId, removeClip, togglePlayback]);
}