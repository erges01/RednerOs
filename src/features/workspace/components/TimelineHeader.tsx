import React from "react";
import { useEditorStore } from "../store/editorStore";
import { getPixelsPerSecond } from "../lib/timelineMath";

interface Props {
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export const TimelineHeader: React.FC<Props> = ({ scrollRef }) => {
  const timeline = useEditorStore((s) => s.timeline);
  const setPlayheadMs = useEditorStore((s) => s.setPlayheadMs);

  if (!timeline) return null;

  const pxPerSecond = getPixelsPerSecond(timeline.zoom);
  // Ensure we always render at least 30 seconds of timeline for visual padding
  const totalSeconds = Math.max(30, Math.ceil(timeline.duration_ms / 1000)); 
  const totalWidth = totalSeconds * pxPerSecond;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scrollLeft = scrollRef.current?.scrollLeft || 0;
    const x = e.clientX - rect.left + scrollLeft;
    const ms = Math.max(0, Math.round((x / pxPerSecond) * 1000));
    setPlayheadMs(ms);
  };

  return (
    <div className="flex h-8 shrink-0 border-b border-[#24242b] bg-[#161619]">
      <div className="w-48 shrink-0 border-r border-[#24242b] bg-[#111113]" />
      <div className="relative h-full flex-1 cursor-pointer overflow-hidden" onClick={handleClick}>
        <div className="absolute h-full" style={{ width: totalWidth }}>
          {Array.from({ length: totalSeconds + 1 }).map((_, sec) => (
            <div
              key={sec}
              className="absolute bottom-0 top-0 border-l border-[#24242b]"
              style={{ left: sec * pxPerSecond }}
            >
              <span className="absolute left-1 top-1 text-[10px] text-gray-500">{sec}s</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};