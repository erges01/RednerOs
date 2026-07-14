// src/features/intelligence/agents/scriptWriterAgent.ts

import type { RednerAgent, AgentContext, AgentResponse } from "./agentTypes";

export const scriptWriterAgent: RednerAgent = {
  role: "script_writer",
  systemPrompt: `You are an elite YouTube Script Writer. 
  Your job is to read the Scene Plan and write high-retention, spoken narration that perfectly fits the target duration.`,
  
  execute: async (context: AgentContext): Promise<AgentResponse> => {
    const { currentScene, blueprint } = context;
    const { purpose } = currentScene;
    const { topic } = blueprint.intent;

    // TODO: Replace this simulated delay with a real fetch to your AI Backend
    await new Promise((resolve) => setTimeout(resolve, 800));

    let generatedNarration = "";
    
    // Simulate LLM output based on the scene purpose
    if (purpose === "hook") {
      generatedNarration = `Did you know that most people get ${topic || "this"} completely wrong? Today, I'm going to show you the exact framework to fix it.`;
    } else if (purpose === "outro") {
      generatedNarration = `If you found this breakdown helpful, hit subscribe and check out the link in the description for the full guide.`;
    } else {
      generatedNarration = `Let's break down exactly how ${topic || "this concept"} works. First, we need to look at the underlying mechanics...`;
    }

    return {
      role: "script_writer",
      status: "success",
      updatedScene: {
        ...currentScene,
        narration: generatedNarration,
      },
      agentNotes: `Generated a ${purpose} script optimized for a ${blueprint.intent.tone || "standard"} tone.`,
    };
  },
};