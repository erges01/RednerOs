import { useState } from "react";
import { useAIStore } from "../store/aiStore";
import { submitAIPrompt } from "../services/aiClient";

export function PromptInput() {
  const [text, setText] = useState("");
  const isProcessing = useAIStore((s) => s.isProcessing);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || isProcessing) return;

    // Send it to the client (which handles the context building and execution)
    submitAIPrompt(text.trim());
    setText(""); // Clear the box
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isProcessing ? "Thinking..." : "Ask Redner something..."}
        disabled={isProcessing}
        className="w-full p-2 text-[13px] text-[#cccccc] bg-[#3c3c3c] border border-transparent rounded focus:outline-none focus:border-[#007acc] disabled:opacity-50 resize-none transition-colors"
        rows={3}
      />
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-[#858585]">Enter to send, Shift+Enter for new line</span>
        <button
          type="submit"
          disabled={!text.trim() || isProcessing}
          className="px-3 py-1 text-[12px] font-medium text-white bg-[#007acc] rounded hover:bg-[#005f9e] disabled:bg-[#3c3c3c] disabled:text-[#858585] disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? "..." : "Send"}
        </button>
      </div>
    </form>
  );
}