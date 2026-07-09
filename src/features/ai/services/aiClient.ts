// src/features/ai/services/aiClient.ts
import { buildCreativeContext } from "./contextBuilder";
import { executeAIResponse } from "./commandExecutor";
import { useAIStore } from "../store/aiStore";
import type { AIResponsePayload } from "../types/commands";

export async function submitAIPrompt(userPrompt: string) {
  const aiStore = useAIStore.getState();
  
  // 1. Instantly show the user's message in the UI and lock the input
  aiStore.addMessage({ role: "user", content: userPrompt });
  aiStore.setProcessing(true);

  try {
    // 2. Build the ultra-lightweight mathematical snapshot of the timeline
    const editorContext = buildCreativeContext();
    if (!editorContext) {
      throw new Error("No active timeline to edit.");
    }

    // 3. Send to your Rust Axum backend
    // Your backend will handle the LLM prompt building and the schema validation
    const response = await fetch("http://localhost:8080/api/ai/copilot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: userPrompt,
        context: editorContext
      })
    });

    if (!response.ok) {
      throw new Error("Backend failed to process AI request");
    }

    // 4. Parse the strictly-typed, validated JSON operations
    const payload: AIResponsePayload = await response.json();

    // 5. Tell the UI what the AI decided to do (Chain of Thought)
    aiStore.addMessage({ role: "ai", content: payload.thoughts });

    // 6. Execute the commands directly onto the timeline!
    executeAIResponse(payload);

  } catch (error: any) {
    console.error("AI Client Error:", error);
    aiStore.addMessage({ 
      role: "ai", 
      content: "Sorry bro, I ran into an error connecting to the engine. Check the console." 
    });
  } finally {
    // Unlock the UI
    aiStore.setProcessing(false);
  }
}