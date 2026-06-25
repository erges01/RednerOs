import React from "react";
import { Play, Pause, SkipBack, FastForward } from "lucide-react";
import { useEditorStore } from "../store/editorStore";
import { getTimelineDurationMs } from "../lib/playbackSelectors";

// Quick helper to format milliseconds into 00:00:00
const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const frames = Math.floor((ms % 1000) / 33); // Approx 30fps
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
};

export const PreviewControls: React.FC = () => {
  const { isPlaying, currentTimeMs, togglePlayback, seekTo, timeline } = useEditorStore();
  const duration = getTimelineDurationMs(timeline);

  return (
    <div className="flex items-center justify-between border-b border-[#24242b] bg-[#141416] px-4 py-2">
      {/* Left: Timecode Display */}
      <div className="font-mono text-sm text-red-500 tracking-wider">
        {formatTime(currentTimeMs)} <span className="text-gray-600">/ {formatTime(duration)}</span>
      </div>

      {/* Center: Transport Controls */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => seekTo(0)} 
          className="text-gray-400 hover:text-white transition"
        >
          <SkipBack size={16} />
        </button>

        <button 
          onClick={togglePlayback} 
          className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-500 hover:scale-105"
        >
          {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-1" />}
        </button>

        <button 
          onClick={() => seekTo(duration)} 
          className="text-gray-400 hover:text-white transition"
        >
          <FastForward size={16} />
        </button>
      </div>

      {/* Right: Spacer for layout balance */}
      <div className="w-16"></div>
    </div>
  );
};