import { useAIStore } from "../store/aiStore";
import { executeAIResponse } from "../services/commandExecutor";

export function CommandReviewPanel() {
  const { pendingOperations, setPendingOperations, addMessage } = useAIStore();

  if (!pendingOperations || pendingOperations.length === 0) return null;

  const handleApprove = () => {
    // 1. Send it to your bulletproof executor
    executeAIResponse({ 
      thoughts: "User approved execution.", 
      operations: pendingOperations 
    });
    
    // 2. Clear the panel and log it in chat
    setPendingOperations(null);
    addMessage({ role: "user", content: "✅ Approved and applied." });
  };

  const handleReject = () => {
    setPendingOperations(null);
    addMessage({ role: "user", content: "❌ Rejected proposed edits." });
  };

 // Helper to make strict JSON readable for humans
  const translateOp = (op: any) => {
    switch (op.type) {
      case "SEEK": return `Move playhead to ${op.timeMs / 1000}s`;
      case "PLAY_PAUSE": return `Toggle Play / Pause`;
      case "DELETE_CLIP": return `Delete clip (${op.clipId.slice(0,6)}...)`;
      case "SPLIT_CLIP": return `Split clip at ${op.timeMs / 1000}s`;
      // 🛠️ NEW UI LABELS
      case "MOVE_CLIP": return `Move clip to ${op.newStartMs / 1000}s`;
      case "DUPLICATE_CLIP": return `Duplicate clip (${op.clipId.slice(0,6)}...)`;
      case "CREATE_MARKER": return `Add marker "${op.label}" at ${op.timeMs / 1000}s`;
      default: return `Unknown action: ${op.type}`;
    }
  };

  return (
    <div className="mt-2 p-3 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-[13px] animate-fade-in">
      <div className="font-semibold text-[#cccccc] mb-2 flex items-center gap-2">
        <span>🛠️ Proposed Edits:</span>
      </div>
      
      <ul className="space-y-1.5 mb-4">
        {pendingOperations.map((op, i) => (
          <li key={i} className="text-[#858585] flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#007acc] rounded-full"></span>
            {translateOp(op)}
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <button 
          onClick={handleApprove} 
          className="px-3 py-1.5 text-[12px] font-medium bg-[#007acc] text-white rounded hover:bg-[#005f9e] transition-colors"
        >
          Approve All
        </button>
        <button 
          onClick={handleReject} 
          className="px-3 py-1.5 text-[12px] font-medium bg-[#3c3c3c] text-[#cccccc] rounded hover:bg-[#4a4a4a] transition-colors"
        >
          Reject
        </button>
      </div>
    </div>
  );
}