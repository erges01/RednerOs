import React from "react";
import { useEditorStore } from "../store/editorStore";
import { msToPx } from "../lib/timelineMath";

export const Playhead: React.FC = () => {
  const timeline = useEditorStore((s) => s.timeline);

  if (!timeline) return null;

  // 192px offsets the track header on the left
  const left = 192 + msToPx(timeline.playhead_ms, timeline.zoom);

  return (
    <div
      className="absolute bottom-0 top-0 z-20 w-px bg-red-600 pointer-events-none"
      style={{ left }}
    >
      <div className="absolute -left-[5px] top-0 h-[10px] w-[11px] bg-red-600" style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)"}} />
    </div>
  );
};