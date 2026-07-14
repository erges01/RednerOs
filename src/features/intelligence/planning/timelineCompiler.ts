// src/features/intelligence/planning/timelineCompiler.ts

import type { ProjectBlueprint } from "./planningTypes";
import { executeCommand, type EditorCommand } from "../../workspace/store/editorCommands";

/**
 * Translates a ProjectBlueprint into a sequence of executable editor commands.
 * This bridges the Intelligence Layer (Planning) with the Workspace Layer (Editor).
 */
export function compileBlueprintToCommands(blueprint: ProjectBlueprint): EditorCommand[] {
  const commands: EditorCommand[] = [];
  let currentTimeMs = 0;

  // Assuming track-0 is our primary video/placeholder track
  const MAIN_TRACK_ID = "track-0";

  for (const scene of blueprint.scenes) {
    // 1. Drop a timeline marker at the start of the scene
    commands.push({
      type: "ADD_MARKER",
      payload: {
        timeMs: currentTimeMs,
        label: `Scene: ${scene.purpose.toUpperCase()}`,
        color: scene.purpose === "hook" ? "#ff4081" : "#4caf50", // Hooks get red, others get green
      }
    });

    // 2. Insert the placeholder clip
    commands.push({
      type: "ADD_CLIP",
      payload: {
        trackId: MAIN_TRACK_ID,
        clip: {
          id: `placeholder-${scene.id}`,
          type: "placeholder", 
          name: `[${scene.purpose.toUpperCase()}] ${scene.visual.camera} - ${scene.visual.setting}`,
          start_ms: currentTimeMs,
          duration_ms: scene.durationMs,
          // Injecting the Director's metadata directly into the clip so the Inspector can show it
          metadata: {
            narration: scene.narration,
            emotion: scene.visual.emotion,
            transitionOut: scene.transitionOut,
          }
        }
      }
    });

    // Advance the playhead mathematically for the next scene
    currentTimeMs += scene.durationMs;
  }

  return commands;
}

/**
 * Instantly scaffolds the timeline by firing the compiled commands into the bus.
 */
export function injectBlueprintToTimeline(blueprint: ProjectBlueprint) {
  const commands = compileBlueprintToCommands(blueprint);
  
  // Fire every command through Redner's bulletproof command bus
  commands.forEach(command => executeCommand(command));
}