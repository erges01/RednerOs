import React from "react";
import { useAssetDrag } from "../hooks/useAssetDrag";

const MOCK_ASSETS = [
  { id: "asset-1", name: "Main Interview.mp4", type: "video" },
  { id: "asset-2", name: "B-Roll Street.mp4", type: "video" },
  { id: "asset-3", name: "Background Music.wav", type: "audio" },
  { id: "asset-4", name: "Logo Overlay.png", type: "image" },
];

export const WorkspaceSidebar: React.FC = () => {
  const { onDragStart } = useAssetDrag();

  return (
    <div className="w-64 flex-shrink-0 bg-[#141416] border-r border-[#24242b] p-4 flex flex-col gap-4 overflow-y-auto">
      <h2 className="text-xs font-semibold text-gray-400 tracking-wider">PROJECT ASSETS</h2>
      
      <div className="flex flex-col gap-2">
        {MOCK_ASSETS.map((asset) => (
          <div
            key={asset.id}
            // --- THE DRAG ENGINE HOOKUP ---
            draggable={true}
            onDragStart={(e) => onDragStart(e, asset)}
            // ------------------------------
            className="p-3 bg-[#1a1a1f] rounded-md border border-[#24242b] cursor-grab hover:bg-[#24242b] active:cursor-grabbing transition-colors"
          >
            <div className="text-sm text-gray-200 truncate">{asset.name}</div>
            <div className="text-[10px] text-gray-500 uppercase mt-1">{asset.type}</div>
          </div>
        ))}
      </div>
    </div>
  );
};