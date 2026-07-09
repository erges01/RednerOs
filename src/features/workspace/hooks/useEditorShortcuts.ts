import { useEffect } from "react";
import { executeCommand } from "../store/editorCommands";

export function useEditorShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // THE SHIELD: Do not trigger shortcuts if the user is typing inside an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // 1. Play / Pause
      if (e.code === "Space") {
        e.preventDefault(); 
        executeCommand({ type: "PLAY_PAUSE" });
      }

      // 2. Delete Active Clip
      if (e.code === "Backspace" || e.code === "Delete") {
        e.preventDefault();
        executeCommand({ type: "DELETE_SELECTED_CLIP" });
      }

      // 3. Time Travel (Undo/Redo)
      if (e.ctrlKey && e.code === "KeyZ") {
        e.preventDefault();
        if (e.shiftKey) {
          executeCommand({ type: "REDO" });
        } else {
          executeCommand({ type: "UNDO" });
        }
      }

      // 4. The Razor Tool (Split)
      if (e.code === "KeyS") {
        e.preventDefault();
        executeCommand({ type: "SPLIT_CLIP" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    
    // Cleanup the listener when the workspace closes
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []); // <-- MASSIVE WIN: Empty dependency array. Zero re-renders!
}