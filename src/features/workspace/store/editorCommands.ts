import { useEditorStore } from "./editorStore";

// 1. Define the Menu of Commands
export type EditorCommand =
  | { type: "PLAY_PAUSE" }
  | { type: "DELETE_SELECTED_CLIP" }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "SPLIT_CLIP" }
  | { type: "SEEK"; payload: { timeMs: number } }
  | { type: "SET_PLAYBACK_RATE"; payload: { rate: number } };

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
      
    default:
      console.warn("Command Bus: Unknown command received", command);
  }
}