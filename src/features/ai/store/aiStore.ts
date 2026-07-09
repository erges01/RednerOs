// src/features/ai/store/aiStore.ts
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
  
  togglePanel: () => void;
  addMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
  setProcessing: (status: boolean) => void;
  clearHistory: () => void;
}

export const useAIStore = create<AIStoreState>((set) => ({
  isOpen: false,
  isProcessing: false,
  messages: [],

  togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),
  
  addMessage: (msg) => set((state) => ({
    messages: [
      ...state.messages, 
      { ...msg, id: crypto.randomUUID(), timestamp: Date.now() }
    ]
  })),

  setProcessing: (status) => set({ isProcessing: status }),
  
  clearHistory: () => set({ messages: [] }),
}));