import { useEffect, useRef } from "react";
import { useAIStore } from "../store/aiStore";
import { PromptInput } from "./PromptInput";
import { CommandReviewPanel } from "./CommandReviewPanel"; // 🛠️ IMPORT ADDED

export function AIChatPanel() {
  // 🛠️ Added pendingOperations to the destructure
  const { isOpen, messages, isProcessing, pendingOperations } = useAIStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 🛠️ Added pendingOperations to dependencies so it scrolls down when the panel appears
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing, pendingOperations]);

  if (!isOpen) return null;

  return (
    <div className="flex flex-col w-[320px] shrink-0 h-full bg-[#252526] border-l border-[#2b2b2b]">
      {/* Header matching VS Code Sidebar */}
      <div className="flex items-center px-4 py-3 text-[11px] font-semibold text-[#cccccc]">
        <span>CHAT</span>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="text-[13px] text-[#858585] flex flex-col gap-4">
            <p>Welcome to Redner Co-Pilot.</p>
            <p>I am watching your timeline. You can ask me to edit pacing, split clips, or explain your timeline architecture.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className="flex flex-col"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-[#cccccc]">
                  {msg.role === "user" ? "You" : "Redner AI"}
                </span>
              </div>
              <div 
                // whitespace-pre-wrap ensures any line breaks from the AI are respected
                className="text-[13px] text-[#cccccc] leading-relaxed whitespace-pre-wrap"
              >
                {msg.content}
              </div>
            </div>
          ))
        )}

        {/* The Thinking Indicator */}
        {isProcessing && (
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-[#cccccc]">Redner AI</span>
            </div>
            <div className="text-[13px] text-[#858585] animate-pulse">
              Analyzing timeline...
            </div>
          </div>
        )}

        {/* 🛠️ NEW: The Review Panel Drops Here */}
        <CommandReviewPanel />

        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[#2b2b2b]">
        <PromptInput />
      </div>
    </div>
  );
}