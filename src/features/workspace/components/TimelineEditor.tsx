import React, { useRef, useEffect } from "react";
import { useEditorStore } from "../store/editorStore";
import { TimelineHeader } from "./TimelineHeader";
import { TimelineTracks } from "./TimelineTracks";

export const TimelineEditor: React.FC = () => {
  const timeline = useEditorStore((s) => s.timeline);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- NEW: Global Delete Key Listener ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        console.log("Key pressed:", e.key); // <--- ADD THIS
      // Don't trigger if user is typing in a text field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        const { selectedClipId, selectedTrackId, removeClip } = useEditorStore.getState();
        
        if (selectedClipId && selectedTrackId) {
          removeClip(selectedTrackId, selectedClipId);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  // ---------------------------------------

  if (!timeline) {
    return <div className="p-4 text-gray-500">No timeline loaded.</div>;
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#111113]">
      <TimelineHeader scrollRef={scrollRef} />
      <TimelineTracks scrollRef={scrollRef} />
    </div>
  );
};