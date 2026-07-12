import { useEditorStore } from "./editorStore";

// 1. Define the Menu of Commands
export type EditorCommand =
  | { type: "PLAY_PAUSE" }
  | { type: "DELETE_SELECTED_CLIP" }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "SPLIT_CLIP" }
  | { type: "SEEK"; payload: { timeMs: number } }
  | { type: "SET_PLAYBACK_RATE"; payload: { rate: number } }
  // 🛠️ NEW: AI Expansion Pack Commands
  | { type: "MOVE_CLIP"; payload: { newStartMs: number } }
  | { type: "DUPLICATE_CLIP" }
  | { type: "ADD_MARKER"; payload: { timeMs: number; label: string } };
  

// 2. The Waiter (Dispatcher)
export function executeCommand(command: EditorCommand) {
  // Grab the database state directly, bypassing React Hooks!
  const store = useEditorStore.getState();

  switch (command.type) {
    case "PLAY_PAUSE":
      store.togglePlayback();
      break;
      
    case "DELETE_SELECTED_CLIP":
      if (store.selectedClipId && store.selectedTrackId) {
        store.removeClip(store.selectedTrackId, store.selectedClipId);
      }
      break;
      
    case "UNDO":
      store.undo();
      break;
      
    case "REDO":
      store.redo();
      break;
      
    case "SPLIT_CLIP":
      store.splitClip();
      break;
      
    case "SEEK":
      store.seekTo(command.payload.timeMs);
      break;
      
    case "SET_PLAYBACK_RATE":
      store.setPlaybackRate(command.payload.rate);
      break;
      
    // 🛠️ NEW: Handling the Expansion Pack (Console logging for now so TS doesn't cry)
    case "MOVE_CLIP":
      // TODO: Build moveClip in editorStore when you're ready
      // if (store.selectedClipId) store.moveClip(store.selectedClipId, command.payload.newStartMs);
      console.log(`[Command Bus] Move clip to ${command.payload.newStartMs}`);
      break;

    case "DUPLICATE_CLIP":
      // TODO: Build duplicateClip in editorStore when you're ready
      // if (store.selectedClipId) store.duplicateClip(store.selectedClipId);
      console.log(`[Command Bus] Duplicate selected clip`);
      break;

    case "ADD_MARKER":
      // TODO: Build addMarker in editorStore when you're ready
      // store.addMarker(command.payload.timeMs, command.payload.label);
      console.log(`[Command Bus] Add marker "${command.payload.label}" at ${command.payload.timeMs}`);
      break;

    default:
      console.warn("Command Bus: Unknown command received", command);
  }
}