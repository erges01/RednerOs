// src/features/intelligence/agents/agentTypes.ts

import type { ProjectBlueprint, ScenePlan } from "../planning/planningTypes";

export type AgentRole = "creative_director" | "script_writer" | "brand_guardian";

export interface AgentContext {
  blueprint: ProjectBlueprint;
  currentScene: ScenePlan;
}

export interface AgentResponse {
  role: AgentRole;
  status: "success" | "failed";
  updatedScene: ScenePlan;
  agentNotes?: string;
}

export interface RednerAgent {
  role: AgentRole;
  systemPrompt: string;
  // Takes a scene and the overall blueprint context, returns a modified scene
  execute: (context: AgentContext) => Promise<AgentResponse>;
}