// src/features/intelligence/agents/agentOrchestrator.ts

import type { ProjectBlueprint, ScenePlan } from "../planning/planningTypes";
import { scriptWriterAgent } from "./scriptWriterAgent";

/**
 * Runs the raw Blueprint through the Multi-Agent Pipeline to inject LLM content 
 * (like scripts and visual directions) before it hits the timeline.
 */
export async function runCreativePipeline(blueprint: ProjectBlueprint): Promise<ProjectBlueprint> {
  console.log("[Orchestrator] Starting Multi-Agent Pipeline...");
  
  const processedScenes: ScenePlan[] = [];

  for (const scene of blueprint.scenes) {
    console.log(`[Orchestrator] Sending ${scene.purpose.toUpperCase()} scene to Script Writer...`);
    
    // In the future, we can add the BrandGuardian here to review the ScriptWriter's output
    const response = await scriptWriterAgent.execute({
      blueprint,
      currentScene: scene
    });

    if (response.status === "success") {
      processedScenes.push(response.updatedScene);
      console.log(`[Orchestrator] ✔ Script Writer finished: ${response.agentNotes}`);
    } else {
      // If the LLM fails or times out, we safely fallback to the placeholder
      processedScenes.push(scene);
      console.warn(`[Orchestrator] ⚠ Agent failed on ${scene.purpose} scene. Falling back to placeholder.`);
    }
  }

  console.log("[Orchestrator] Pipeline Complete. Final Blueprint ready for compilation.");

  // Return the finalized, fully-scripted blueprint
  return {
    ...blueprint,
    scenes: processedScenes,
  };
}