import { create } from "zustand";

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: number;
}

interface AIStoreState {
  isOpen: boolean;
  isProcessing: boolean;
  messages: ChatMessage[];
  pendingOperations: any[] | null; // 🛠️ NEW: The Holding Pen
  
  togglePanel: () => void;
  addMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
  setProcessing: (status: boolean) => void;
  clearHistory: () => void;
  setPendingOperations: (ops: any[] | null) => void; // 🛠️ NEW: Action to update the pen
  submitPrompt: (prompt: string, currentContext: any) => Promise<void>;
}

export const useAIStore = create<AIStoreState>((set, get) => ({
  isOpen: false,
  isProcessing: false,
  messages: [],
  pendingOperations: null, // 🛠️ NEW: Initial state

  togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),
  
  addMessage: (msg) => set((state) => ({
    messages: [
      ...state.messages, 
      { ...msg, id: crypto.randomUUID(), timestamp: Date.now() }
    ]
  })),

  setProcessing: (status) => set({ isProcessing: status }),
  
  clearHistory: () => set({ messages: [] }),

  setPendingOperations: (ops) => set({ pendingOperations: ops }), // 🛠️ NEW

  submitPrompt: async (prompt: string, currentContext: any) => {
    // 🛠️ Grab setPendingOperations from the store
    const { messages, addMessage, setProcessing, setPendingOperations } = get();

    // 1. Instantly show user prompt & spin up the loading state
    addMessage({ role: "user", content: prompt });
    setProcessing(true);

    try {
      // 2. Map frontend UI state to the exact schema Rust expects (ai -> model, content -> text)
      const historyPayload = messages.map(m => ({
        role: m.role === "ai" ? "model" : "user",
        text: m.content
      }));

      // 3. Fire to the Rust backend orchestration layer
      const response = await fetch("http://127.0.0.1:8080/api/ai/chat", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          history: historyPayload,
          context: currentContext
        })
      });

      if (!response.ok) throw new Error("AI Engine failed to respond");

      const data = await response.json();

      // 4. Drop the AI's thoughts into the chat panel
      addMessage({ role: "ai", content: data.thoughts });

      // 5. 🛠️ NEW: Stage the operations for review instead of auto-executing
      if (data.operations && data.operations.length > 0) {
        setPendingOperations(data.operations);
      }

    } catch (error) {
      console.error("🚨 AI Dispatch Error:", error);
      addMessage({ role: "ai", content: "Omo, connection failed. Check the Rust terminal." });
    } finally {
      setProcessing(false);
    }
  }
}));