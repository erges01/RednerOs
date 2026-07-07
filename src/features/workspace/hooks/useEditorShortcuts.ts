import { useEffect } from "react";
import { useEditorStore } from "../store/editorStore";

export function useEditorShortcuts() {
  const selectedClipId = useEditorStore((s) => s.selectedClipId);
  const selectedTrackId = useEditorStore((s) => s.selectedTrackId);
  const removeClip = useEditorStore((s) => s.removeClip);
  const togglePlayback = useEditorStore((s) => s.togglePlayback);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const splitClip = useEditorStore((s) => s.splitClip);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // THE SHIELD: Do not trigger shortcuts if the user is typing inside an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // 1. Play / Pause
      if (e.code === "Space") {
        e.preventDefault(); 
        togglePlayback();
      }

      // 2. Delete Active Clip
      if (e.code === "Backspace" || e.code === "Delete") {
        if (selectedClipId && selectedTrackId) {
          e.preventDefault();
          removeClip(selectedTrackId, selectedClipId);
        }
      }

      // 3. Time Travel (Undo/Redo)
      if (e.ctrlKey && e.code === "KeyZ") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }

      // 4. The Razor Tool (Split)
      if (e.code === "KeyS") {
        e.preventDefault();
        splitClip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    
    // Cleanup the listener when the workspace closes
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedClipId, selectedTrackId, removeClip, togglePlayback, undo, redo, splitClip]);
}