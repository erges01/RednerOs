import React, { useRef } from "react";
import type { Track } from "../types/editor";
import { TimelineClip } from "./TimelineClip";
import { Film, Music, Type } from "lucide-react";
import { useEditorStore } from "../store/editorStore";
import { getPixelsPerSecond } from "../lib/timelineMath";

interface Props {
  track: Track;
  timelineWidth: number;
}

export const TimelineTrackRow: React.FC<Props> = ({ track, timelineWidth }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  
  const addClipFromAsset = useEditorStore((s) => s.addClipFromAsset);
  const timeline = useEditorStore((s) => s.timeline);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const assetData = e.dataTransfer.getData("application/json");
    if (!assetData || !timeline) return;

    try {
      const asset = JSON.parse(assetData);
      
      // Strict typing: Don't allow audio on video tracks, but ALLOW images on video tracks!
      const isImageOnVideoTrack = asset.type === "image" && track.type === "video";
      
      if (asset.type !== track.type && !isImageOnVideoTrack && track.type !== "text") {
         alert(`Cannot drop a ${asset.type} file into a ${track.type} track!`);
         return;
      }

      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Calculate exact drop time based on mouse X coordinate relative to the track
      const dropX = e.clientX - rect.left;
      const pxPerSecond = getPixelsPerSecond(timeline.zoom);
      const startMs = Math.max(0, (dropX / pxPerSecond) * 1000);

      // Pass arguments exactly as defined in the store: (asset, trackId, startMs)
      addClipFromAsset(asset, track.id, startMs);
      
    } catch (error) {
      console.error("Failed to parse dropped asset data. Ensure you are dragging a valid asset.", error);
    }
  };

  const getIcon = () => {
    if (track.type === "video") return <Film size={12} />;
    if (track.type === "audio") return <Music size={12} />;
    return <Type size={12} />;
  };

  return (
    <div className="flex h-20 border-b border-[#24242b]">
      {/* Track Header (Left sidebar panel) */}
      <div className="flex w-48 shrink-0 flex-col justify-center border-r border-[#24242b] bg-[#141416] px-3 z-10">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
          {getIcon()} <span className="truncate">{track.name}</span>
        </div>
      </div>
      
      {/* Track Droppable Area */}
      <div 
        ref={trackRef}
        className="relative h-full bg-[#111113] hover:bg-[#1a1a1f] transition-colors" 
        style={{ width: timelineWidth }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {track.clips.map((clip) => (
          <TimelineClip key={clip.id} clip={clip} track={track} />
        ))}
      </div>
    </div>
  );
};