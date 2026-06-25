import React from "react";
import { Settings, Copy, Trash2, Clock, Type } from "lucide-react";
// FIX: Adjusted the import path to properly reach your stores folder
import { useProjectStore } from "../../../stores/projectStore";
import { useEditorStore } from "../store/editorStore";

export const WorkspaceInspector: React.FC = () => {
  // FIX: Destructured selectedAsset to avoid implicit 'any' types
  const { selectedAsset } = useProjectStore();
  const { timeline, selectedClipId, selectedTrackId, updateClipMeta, removeClip, duplicateClip } = useEditorStore();

  const selectedTrack = timeline?.tracks.find((t) => t.id === selectedTrackId);
  const selectedClip = selectedTrack?.clips.find((c) => c.id === selectedClipId);

  return (
    <section className="flex w-72 shrink-0 flex-col border-l border-[#24242b] bg-[#111113]">
      <div className="flex items-center gap-2 border-b border-[#24242b] p-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
        <Settings size={13} /> Inspector
      </div>
      
      <div className="flex-1 space-y-4 overflow-y-auto p-4 text-xs text-gray-400">
        
        {selectedClip && selectedTrackId ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#24242b] pb-2">
              <div className="text-[10px] font-bold uppercase text-red-500">Clip Editor</div>
              <div className="flex gap-2">
                <button 
                  onClick={() => duplicateClip(selectedTrackId, selectedClip.id)}
                  className="rounded bg-[#24242b] p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white transition"
                  title="Duplicate Clip"
                >
                  <Copy size={12} />
                </button>
                <button 
                  onClick={() => {
                    removeClip(selectedTrackId, selectedClip.id);
                    useEditorStore.getState().selectClip(null);
                  }}
                  className="rounded bg-red-950/50 p-1.5 text-red-400 hover:bg-red-900 hover:text-white transition"
                  title="Delete Clip"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[10px] uppercase text-gray-500"><Type size={10} /> Clip Label</label>
              <input 
                type="text" 
                // FIX: Fallback to "" if label is null
                value={selectedClip.label || ""}
                onChange={(e) => updateClipMeta(selectedTrackId, selectedClip.id, { label: e.target.value })}
                className="w-full rounded border border-[#24242b] bg-[#1a1a1f] p-2 text-xs text-gray-200 outline-none focus:border-gray-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] uppercase text-gray-500"><Clock size={10} /> Start (ms)</label>
                <input 
                  type="number" 
                  // FIX: Fallback to 0
                  value={selectedClip.start_ms || 0}
                  onChange={(e) => updateClipMeta(selectedTrackId, selectedClip.id, { start_ms: Number(e.target.value) })}
                  className="w-full rounded border border-[#24242b] bg-[#1a1a1f] p-2 text-xs text-gray-200 outline-none focus:border-gray-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] uppercase text-gray-500"><Clock size={10} /> Duration</label>
                <input 
                  type="number" 
                  // FIX: Fallback to 0
                  value={selectedClip.duration_ms || 0}
                  onChange={(e) => updateClipMeta(selectedTrackId, selectedClip.id, { duration_ms: Number(e.target.value) })}
                  className="w-full rounded border border-[#24242b] bg-[#1a1a1f] p-2 text-xs text-gray-200 outline-none focus:border-gray-500"
                />
              </div>
            </div>
          </div>
        ) : 
        
        selectedAsset ? (
          <div className="space-y-2 rounded border border-[#24242b] bg-[#18181c] p-3">
            <div className="text-[10px] font-bold uppercase text-gray-500">Selected Asset</div>
            <div className="truncate font-semibold text-gray-200">{selectedAsset.name}</div>
            <div className="text-gray-500">Type: <span className="font-mono text-gray-300">{selectedAsset.type}</span></div>
            <div className="text-gray-500">Size: <span className="font-mono text-gray-300">{(selectedAsset.size / 1024 / 1024).toFixed(2)} MB</span></div>
          </div>
        ) : 
        
        (
          <div className="leading-normal text-gray-600 text-center mt-10">
            Select an asset from the bin or a clip on the timeline to inspect details.
          </div>
        )}
        
      </div>
    </section>
  );
};