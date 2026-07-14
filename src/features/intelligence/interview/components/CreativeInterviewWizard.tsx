// src/features/intelligence/interview/components/CreativeInterviewWizard.tsx

import { useState, useEffect } from "react";
import { startInterview, submitAnswer, goBack, cancelInterview } from "../interviewEngine";
import { QUESTION_BANK } from "../questionBank";
import { useCreatorMemoryStore } from "../memoryStore";
import { buildFinalIntent } from "../intentParser";
import type { InterviewSession } from "../interviewTypes";
import { generateBlueprint } from "../../planning/blueprintGenerator";
import { runCreativePipeline } from "../../agents/agentOrchestrator";
import { injectBlueprintToTimeline } from "../../planning/timelineCompiler";

interface WizardProps {
  onComplete: (finalIntent: any) => void;
  onCancel: () => void;
}

export function CreativeInterviewWizard({ onComplete, onCancel }: WizardProps) {
  const [session, setSession] = useState<InterviewSession>(startInterview());
  const [textValue, setTextValue] = useState("");
  const { memory, updateMemoryFromIntent } = useCreatorMemoryStore();

  // Reset the text input whenever the question changes
  useEffect(() => {
    setTextValue("");
  }, [session.currentQuestionId]);

  if (session.state === "CANCELLED") {
    return null;
  }

  // Final State: Display the extracted payload and prepare for Blueprint Planning
  if (session.state === "COMPLETED") {
    const finalIntent = buildFinalIntent(session.intent, memory);
    return (
      <div className="flex flex-col gap-4 p-6 bg-[#252526] border border-[#3c3c3c] rounded shadow-lg text-[#cccccc] w-full max-w-lg mx-auto">
        <h2 className="text-[16px] font-bold text-white">Interview Complete</h2>
        <p className="text-[13px] text-[#858585]">Redner has extracted your creative intent.</p>
        
        <div className="text-[12px] bg-[#1e1e1e] p-4 rounded font-mono border border-[#3c3c3c] overflow-x-auto">
          <pre>{JSON.stringify(finalIntent, null, 2)}</pre>
        </div>
        
        <div className="flex justify-end mt-2">
          <button
            onClick={async () => {
              updateMemoryFromIntent(finalIntent);
              
              // 1. Generate the mathematical skeleton
              const rawBlueprint = generateBlueprint(finalIntent);
              
              // 2. Run the Multi-Agent Pipeline to write the scripts
              const finalBlueprint = await runCreativePipeline(rawBlueprint);
              
              // 3. Fire the completed blueprint directly into the timeline!
              injectBlueprintToTimeline(finalBlueprint);
              
              onComplete(finalBlueprint);
            }}
            className="px-4 py-2 bg-[#cccccc] text-[#1e1e1e] font-bold rounded text-[13px] hover:bg-white transition-colors"
          >
            Generate Project Blueprint
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = session.currentQuestionId ? QUESTION_BANK[session.currentQuestionId] : null;
  if (!currentQuestion) return null;

  const handleNextText = () => {
    if (!textValue.trim()) return;
    setSession(submitAnswer(session, textValue.trim()));
  };

  const handleChoice = (value: string) => {
    setSession(submitAnswer(session, value));
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto bg-[#252526] border border-[#3c3c3c] rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-[#3c3c3c]">
        <span className="text-[12px] font-bold text-[#858585] uppercase tracking-wider">
          Creative Interview
        </span>
        <button 
          onClick={() => { 
            setSession(cancelInterview(session)); 
            onCancel(); 
          }} 
          className="text-[#858585] hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col gap-6">
        <h3 className="text-[18px] font-medium text-white leading-snug">
          {currentQuestion.text}
        </h3>

        <div className="flex flex-col gap-2">
          {currentQuestion.type === "free_text" ? (
            <div className="flex flex-col gap-3">
              <textarea
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleNextText();
                  }
                }}
                placeholder="Type your answer here..."
                className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded p-3 text-[14px] text-[#cccccc] focus:outline-none focus:border-[#858585] min-h-[100px] resize-none"
                autoFocus
              />
              <button
                onClick={handleNextText}
                disabled={!textValue.trim()}
                className="self-end px-5 py-2 bg-[#cccccc] text-[#1e1e1e] font-bold rounded text-[13px] disabled:opacity-30 transition-all hover:bg-white"
              >
                Next
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {currentQuestion.options?.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleChoice(opt.value)}
                  className="text-left px-4 py-3 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-[14px] text-[#cccccc] hover:border-[#cccccc] hover:text-white transition-colors"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#3c3c3c] flex justify-between items-center bg-[#1e1e1e] rounded-b-lg">
        <button
          onClick={() => setSession(goBack(session))}
          disabled={session.history.length === 0}
          className="text-[12px] font-medium text-[#858585] hover:text-[#cccccc] disabled:opacity-30 transition-colors"
        >
          ← Go Back
        </button>
        <span className="text-[11px] font-mono text-[#858585]">
          Question {session.history.length + 1}
        </span>
      </div>
    </div>
  );
}