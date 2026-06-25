import { useEffect, useRef } from "react";
import { useEditorStore } from "../store/editorStore";
import { getTimelineDurationMs } from "../lib/playbackSelectors";

export const useTimelinePlayback = () => {
  const { isPlaying, playbackRate, seekTo, pause, timeline } = useEditorStore();
  
  // FIX: Explicitly added `| undefined` and passed `(undefined)` as the initial value
  const requestRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // If not playing, kill the animation frame
    if (!isPlaying) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const duration = getTimelineDurationMs(timeline);
    lastTimeRef.current = performance.now();

    const loop = (time: number) => {
      // Calculate exactly how many milliseconds passed since the last frame
      const delta = time - lastTimeRef.current!;
      lastTimeRef.current = time;

      // Calculate the next frame time using Zustand's fresh state
      const nextTime = useEditorStore.getState().currentTimeMs + (delta * playbackRate);

      if (nextTime >= duration) {
        // We reached the end of the timeline
        seekTo(duration);
        pause();
      } else {
        // Step forward and request the next frame
        seekTo(nextTime);
        requestRef.current = requestAnimationFrame(loop);
      }
    };

    // Kickstart the loop
    requestRef.current = requestAnimationFrame(loop);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, playbackRate, timeline, pause, seekTo]);
};