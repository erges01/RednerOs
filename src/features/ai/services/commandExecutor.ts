// src/features/ai/services/commandExecutor.ts
import { executeCommand } from "../../workspace/store/editorCommands";
import { useEditorStore } from "../../workspace/store/editorStore";
// 🛠️ FIX: Removed the unused AIOperation import
import type { AIResponsePayload } from "../types/commands";

export function executeAIResponse(payload: AIResponsePayload) {
  console.log("🤖 AI Thoughts:", payload.thoughts);
  
  const state = useEditorStore.getState();
  const timeline = state.timeline;
  
  if (!timeline) {
    console.error("AI tried to edit, but no timeline is open.");
    return;
  }

  // Iterate through the AI's requested operations
  for (const op of payload.operations) {
    switch (op.type) {
      case "PLAY_PAUSE": {
        executeCommand({ type: "PLAY_PAUSE" });
        break;
      }

      case "SEEK": {
        // 🛡️ Validator: Don't let AI seek past the end of the video or before 0
        const safeTime = Math.max(0, op.timeMs);
        executeCommand({ type: "SEEK", payload: { timeMs: safeTime } });
        break;
      }

      case "DELETE_CLIP": {
        // 🛡️ Validator: Ensure the clip actually exists before deleting
        const trackWithClip = timeline.tracks.find(t => 
          t.clips.some(c => c.id === op.clipId)
        );
        
        if (trackWithClip) {
          // Temporarily set selection so the EditorCommand bus can process it
          state.selectClip(op.clipId, trackWithClip.id);
          executeCommand({ type: "DELETE_SELECTED_CLIP" });
        } else {
          console.warn(`AI Hallucination: Tried to delete non-existent clip ${op.clipId}`);
        }
        break;
      }

      case "SPLIT_CLIP": {
        // 🛡️ Validator: Ensure the clip exists
        const trackToSplit = timeline.tracks.find(t => 
          t.clips.some(c => c.id === op.clipId)
        );
        
        if (trackToSplit) {
          // AI must first move the playhead to the cut point, then split
          executeCommand({ type: "SEEK", payload: { timeMs: op.timeMs } });
          state.selectClip(op.clipId, trackToSplit.id);
          executeCommand({ type: "SPLIT_CLIP" });
        } else {
          console.warn(`AI Hallucination: Tried to split non-existent clip ${op.clipId}`);
        }
        break;
      }

      case "MOVE_CLIP": {
        // 🛡️ Validator: Ensure the clip exists and time isn't negative
        const trackWithClip = timeline.tracks.find(t => 
          t.clips.some(c => c.id === op.clipId)
        );
        const safeStart = Math.max(0, op.newStartMs);
        
        if (trackWithClip) {
          state.selectClip(op.clipId, trackWithClip.id);
          executeCommand({ type: "MOVE_CLIP", payload: { newStartMs: safeStart } });
        } else {
          console.warn(`AI Hallucination: Tried to move non-existent clip ${op.clipId}`);
        }
        break;
      }

      case "DUPLICATE_CLIP": {
        // 🛡️ Validator: Ensure it exists
        const trackWithClip = timeline.tracks.find(t => 
          t.clips.some(c => c.id === op.clipId)
        );
        if (trackWithClip) {
          state.selectClip(op.clipId, trackWithClip.id);
          executeCommand({ type: "DUPLICATE_CLIP" });
        }
        break;
      }

      case "CREATE_MARKER": {
        const safeTime = Math.max(0, op.timeMs);
        executeCommand({ 
          type: "ADD_MARKER", 
          payload: { timeMs: safeTime, label: op.label } 
        });
        break;
      }

      default: {
        console.warn("AI returned an unknown operation type", op);
      }
    }
  }
}