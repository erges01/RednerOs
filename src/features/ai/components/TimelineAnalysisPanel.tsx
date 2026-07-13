// src/features/ai/components/TimelineAnalysisPanel.tsx
import { useState } from "react";
import { useEditorStore } from "../../workspace/store/editorStore";
import { executeCommand } from "../../workspace/store/editorCommands";
import { analyzePacing, type PacingIssue } from "../intelligence/pacingAnalyzer";
import { analyzeStructure, type StructuralIssue } from "../intelligence/structureAnalyzer";

// Combine both issue types so the panel can render them together
type EditorIssue = PacingIssue | StructuralIssue;

export function TimelineAnalysisPanel() {
  const [issues, setIssues] = useState<EditorIssue[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleAnalyze = () => {
    const timeline = useEditorStore.getState().timeline;
    
    if (!timeline) {
      console.warn("No timeline found to analyze.");
      return;
    }

    // Run both heuristic engines
    const pacingIssues = analyzePacing(timeline);
    const structureIssues = analyzeStructure(timeline);
    
    setIssues([...pacingIssues, ...structureIssues]);
    setHasAnalyzed(true);
  };

  const handleApplyFix = (issue: EditorIssue) => {
    if (issue.suggestedCommand) {
      // Fire it into the bulletproof command bus
      executeCommand(issue.suggestedCommand);
      
      // Remove the issue from the UI since we fixed it
      setIssues((prev) => prev.filter((i) => i.id !== issue.id));
    }
  };

  const getFixLabel = (type: EditorIssue["type"]) => {
    switch (type) {
      case "DEAD_AIR": return "Ripple Delete Gap";
      case "LONG_CLIP": return "Jump to Timestamp";
      case "WEAK_HOOK": return "Jump to 3s";
      case "ABRUPT_OUTRO": return "Jump to End";
      default: return "Apply Fix";
    }
  };

  return (
    <div className="mb-4 flex flex-col gap-2">
      <button 
        onClick={handleAnalyze}
        className="w-full py-2 bg-[#2d2d2d] hover:bg-[#3d3d3d] border border-[#3c3c3c] rounded text-[12px] font-semibold text-[#cccccc] flex items-center justify-center transition-colors"
      >
        Analyze Timeline Pacing & Structure
      </button>

      {hasAnalyzed && issues.length === 0 && (
        <div className="text-[12px] text-[#4caf50] p-2 bg-[#1e1e1e] border border-[#2b2b2b] rounded text-center">
          Timeline pacing and structure look flawless. No issues detected.
        </div>
      )}

      {issues.length > 0 && (
        <div className="flex flex-col gap-2 mt-2 animate-fade-in">
          <div className="text-[11px] font-bold text-[#858585] uppercase tracking-wider">
            Detected Issues ({issues.length})
          </div>
          
          {issues.map((issue) => (
            <div key={issue.id} className="p-3 bg-[#1e1e1e] border border-[#ffcc0040] rounded flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[13px] text-[#cccccc] leading-snug">
                  {issue.description}
                </span>
                <span className="text-[11px] font-mono text-[#858585] bg-[#252526] px-1.5 py-0.5 rounded">
                  {(issue.timeMs / 1000).toFixed(1)}s
                </span>
              </div>
              
              {issue.suggestedCommand && (
                <button 
                  onClick={() => handleApplyFix(issue)}
                  className="mt-1 self-start px-3 py-1 bg-[#ffcc0020] hover:bg-[#ffcc0040] text-[#ffcc00] border border-[#ffcc0040] rounded text-[11px] font-medium transition-colors"
                >
                  {getFixLabel(issue.type)}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}