import React from "react";
import { useEditorStore } from "../store/editorStore";
import { TimelineTrackRow } from "./TimelineTrackRow";
import { Playhead } from "./Playhead";
import { getPixelsPerSecond } from "../lib/timelineMath";

interface Props {
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export const TimelineTracks: React.FC<Props> = ({ scrollRef }) => {
  const timeline = useEditorStore((s) => s.timeline);

  if (!timeline) return null;

  const pxPerSecond = getPixelsPerSecond(timeline.zoom);
  const totalSeconds = Math.max(30, Math.ceil(timeline.duration_ms / 1000));
  const totalWidth = totalSeconds * pxPerSecond;

  return (
    <div ref={scrollRef} className="relative flex-1 overflow-auto bg-[#0c0c0e]">
      {/* 192px is the width of the left track headers (w-48) */}
      <div className="relative min-h-full" style={{ width: totalWidth + 192 }}>
        <Playhead />
        {timeline.tracks
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((track) => (
            <TimelineTrackRow key={track.id} track={track} timelineWidth={totalWidth} />
          ))}
      </div>
    </div>
  );
};