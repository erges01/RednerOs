// src/features/ai/services/aiClient.ts
import { buildCreativeContext } from "./contextBuilder";
// 🛠️ FIX: Removed executeAIResponse import since the Review Panel handles execution now
import { useAIStore } from "../store/aiStore";
import type { AIResponsePayload } from "../types/commands";

export async function submitAIPrompt(userPrompt: string) {
  const aiStore = useAIStore.getState();
  
  // 1. Grab the existing history BEFORE we add the new message to it
  const historyPayload = aiStore.messages.map(m => ({
    role: m.role === "ai" ? "model" : "user",
    text: m.content
  }));

  // 2. Instantly show the user's message in the UI and lock the input
  aiStore.addMessage({ role: "user", content: userPrompt });
  aiStore.setProcessing(true);

  try {
    // 3. Build the ultra-lightweight mathematical snapshot of the timeline
    const editorContext = buildCreativeContext();
    if (!editorContext) {
      throw new Error("No active timeline to edit.");
    }

    // 4. Send to your Rust Axum backend (now with conversation history!)
    const response = await fetch("http://localhost:8080/api/ai/copilot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: userPrompt,
        history: historyPayload, 
        context: editorContext
      })
    });

    if (!response.ok) {
      throw new Error("Backend failed to process AI request");
    }

    // 5. Parse the strictly-typed, validated JSON operations
    const payload: AIResponsePayload = await response.json();

    // 6. Tell the UI what the AI decided to do (Chain of Thought)
    aiStore.addMessage({ role: "ai", content: payload.thoughts });

    // 7. Stage the commands for review instead of executing immediately!
    if (payload.operations && payload.operations.length > 0) {
      aiStore.setPendingOperations(payload.operations);
    }

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