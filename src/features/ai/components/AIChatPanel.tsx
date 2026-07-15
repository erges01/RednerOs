import { useEffect, useRef } from "react";
import { useAIStore } from "../store/aiStore";
import { PromptInput } from "./PromptInput";
import { CommandReviewPanel } from "./CommandReviewPanel";
import { TimelineAnalysisPanel } from "./TimelineAnalysisPanel";
import { CreativeInterviewWizard } from "../../intelligence/interview/components/CreativeInterviewWizard";

// --- The Voice Engine Imports ---
import { generateAndInjectVoiceover } from "../../creator/services/voiceInjector";
import { useEditorStore } from "../../workspace/store/editorStore";
import { injectBrandedTextClip } from "../../creator/services/brandInjector";
import { injectVisualBroll } from "../../creator/services/visualInjector";
export function AIChatPanel() {
  const { isOpen, messages, isProcessing, pendingOperations } = useAIStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing, pendingOperations]);

  if (!isOpen) return null;

  return (
    <div className="flex flex-col w-[320px] shrink-0 h-full bg-[#252526] border-l border-[#2b2b2b]">
      {/* Header matching VS Code Sidebar */}
      <div className="flex items-center px-4 py-3 text-[11px] font-semibold text-[#cccccc] border-b border-[#2b2b2b]">
        <span>CHAT</span>
      </div>

      {/* --- QUICK ACTIONS BAR --- */}
      <div className="p-4 border-b border-[#2b2b2b] flex flex-col gap-2">
        <button
          onClick={async () => {
            const currentPlayhead = useEditorStore.getState().timeline?.playhead_ms || 0;
            console.log("🎙️ Generating AI Voiceover...");
            await generateAndInjectVoiceover(
              "Welcome back to another Rust tutorial. Today we are looking at ownership and borrowing.", 
              currentPlayhead
            );
          }}
          className="w-full flex items-center justify-center gap-2 rounded bg-[#0e639c] px-3 py-2 text-[12px] font-bold text-white transition-colors hover:bg-[#1177bb]"
        >
          🎙️ Drop AI Voiceover
        </button>

        <button
          onClick={() => {
            const currentPlayhead = useEditorStore.getState().timeline?.playhead_ms || 0;
            injectBrandedTextClip("MASTERING RUST", currentPlayhead, 3000);
          }}
          className="w-full flex items-center justify-center gap-2 rounded border border-[#007acc] px-3 py-2 text-[12px] font-bold text-[#007acc] transition-colors hover:bg-[#007acc] hover:text-white"
        >
          🎨 Drop Branded Title
        </button>

        <button
          onClick={async () => {
            const currentPlayhead = useEditorStore.getState().timeline?.playhead_ms || 0;
            await injectVisualBroll("Server Rack Architecture", currentPlayhead);
          }}
          className="w-full flex items-center justify-center gap-2 rounded border border-[#4e94ce] px-3 py-2 text-[12px] font-bold text-[#4e94ce] transition-colors hover:bg-[#4e94ce] hover:text-white"
        >
          🎬 Drop AI B-Roll
        </button>
        
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* The Interview Wizard drops right here for testing */}
        <CreativeInterviewWizard 
          onComplete={(intent) => console.log("INTERVIEW FINISHED! Intent:", intent)} 
          onCancel={() => console.log("User clicked cancel")} 
        />

        {/* The Pacing Analyzer drops right here at the top */}
        <TimelineAnalysisPanel />

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

        {/* The Review Panel Drops Here */}
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