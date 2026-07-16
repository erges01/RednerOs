import React, { useRef, useState, useEffect } from "react";
import { Trash2 } from "lucide-react"; 
import type { Clip, Track } from "../types/editor";
import { useEditorStore } from "../store/editorStore";
import { msToPx, getPixelsPerSecond } from "../lib/timelineMath";

interface Props {
  clip: Clip;
  track: Track;
}

export const TimelineClip: React.FC<Props> = ({ clip, track }) => {
  const timeline = useEditorStore((s) => s.timeline);
  const selectedClipId = useEditorStore((s) => s.selectedClipId);
  const selectClip = useEditorStore((s) => s.selectClip);
  const moveClip = useEditorStore((s) => s.moveClip);
  const resizeClipLeft = useEditorStore((s) => s.resizeClipLeft);
  const resizeClipRight = useEditorStore((s) => s.resizeClipRight);
  const removeClip = useEditorStore((s) => s.removeClip);

  const [dragAction, setDragAction] = useState<'move' | 'resizeLeft' | 'resizeRight' | null>(null);
  const dragStartData = useRef<{ startX: number; initialStartMs: number; initialDurationMs: number } | null>(null);

  if (!timeline) return null;

  const pxPerSecond = getPixelsPerSecond(timeline.zoom);
  const left = msToPx(clip.start_ms, timeline.zoom);
  const width = msToPx(clip.duration_ms, timeline.zoom);
  const isSelected = selectedClipId === clip.id;

  const handlePointerDown = (e: React.PointerEvent, action: 'move' | 'resizeLeft' | 'resizeRight') => {
    e.stopPropagation();
    selectClip(clip.id, track.id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    
    setDragAction(action);
    dragStartData.current = {
      startX: e.clientX,
      initialStartMs: clip.start_ms,
      initialDurationMs: clip.duration_ms,
    };
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragAction || !dragStartData.current) return;

      const deltaX = e.clientX - dragStartData.current.startX;
      const deltaMs = (deltaX / pxPerSecond) * 1000;

      if (dragAction === 'move') {
        moveClip({ trackId: track.id, clipId: clip.id, newStartMs: Math.round(dragStartData.current.initialStartMs + deltaMs) });
      } else if (dragAction === 'resizeLeft') {
        const newStartMs = Math.max(0, dragStartData.current.initialStartMs + deltaMs);
        const newDurationMs = dragStartData.current.initialDurationMs + (dragStartData.current.initialStartMs - newStartMs);
        resizeClipLeft({ trackId: track.id, clipId: clip.id, newStartMs: Math.round(newStartMs), newDurationMs: Math.round(newDurationMs) });
      } else if (dragAction === 'resizeRight') {
        resizeClipRight({ trackId: track.id, clipId: clip.id, newDurationMs: Math.round(dragStartData.current.initialDurationMs + deltaMs) });
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (dragAction) {
        setDragAction(null);
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      }
    };

    if (dragAction) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragAction, pxPerSecond, track.id, clip.id, moveClip, resizeClipLeft, resizeClipRight]);

  // 🎭 DYNAMIC STYLING LOGIC
  const getStyleClasses = () => {
    if (track.type === "performance") return "bg-[#4c1d95]/90 border-[#8b5cf6]";
    if (track.type === "video") return "bg-blue-900/80 border-[#3f3f46]";
    return "bg-emerald-900/80 border-[#3f3f46]";
  };

  const borderClass = isSelected ? "border-white" : "border-transparent";

  // 🛠️ RENDER METADATA OR LABEL
  const renderContent = () => {
    if (clip.metadata && typeof clip.metadata === 'object') {
       const meta = clip.metadata as any;
       return (
         <div className="flex flex-col truncate leading-tight">
            <span className="text-[9px] uppercase opacity-70">{meta.directiveType}</span>
            <span className="font-bold truncate">{meta.value}</span>
         </div>
       );
    }
    return <span className="truncate">{clip.label || clip.type}</span>;
  };

  return (
    <div
      onPointerDown={(e) => handlePointerDown(e, 'move')}
      className={`absolute top-2 bottom-2 rounded-md border ${getStyleClasses()} ${borderClass} px-2 py-1 text-xs text-white cursor-grab group transition-all`}
      style={{ left, width }}
    >
      {/* DELETE BIN BUTTON */}
      {isSelected && (
        <button 
          onClick={(e) => { e.stopPropagation(); removeClip(track.id, clip.id); }}
          className="absolute top-0 right-0 m-1 z-50 rounded bg-red-900/90 p-1 text-red-200 hover:bg-red-700 hover:text-white transition-colors"
        >
          <Trash2 size={12} />
        </button>
      )}

      {/* Resize Handles */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-white/10 z-20"
        onPointerDown={(e) => handlePointerDown(e, 'resizeLeft')}
      />
      
      {/* Content */}
      <div className="pointer-events-none select-none px-2 h-full flex items-center">
        {renderContent()}
      </div>

      <div 
        className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-white/10 z-20"
        onPointerDown={(e) => handlePointerDown(e, 'resizeRight')}
      />
    </div>
  );
};