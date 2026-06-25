import React, { useEffect, useRef } from "react";
import { useEditorStore } from "../store/editorStore";
import { resolvePreviewState } from "../lib/previewResolver";
import { useProjectStore } from "../../../stores/projectStore";

// --- SUBCOMPONENT: Encapsulated Audio Player ---
const AudioClipPlayer = ({ clip, currentTimeMs, isPlaying }: { clip: any, currentTimeMs: number, isPlaying: boolean }) => {
  const currentProject = useProjectStore((s: any) => s.currentProject);
  const audioAsset = currentProject?.assets.find((a: any) => a.id === clip.asset_id);
  const audioRef = useRef<HTMLAudioElement>(null);

  // 1. Scrubbing & Drift Sync
  useEffect(() => {
    if (!audioRef.current) return;
    const targetTimeSeconds = ((currentTimeMs - clip.start_ms) + (clip.source_offset_ms || 0)) / 1000;
    const drift = Math.abs(audioRef.current.currentTime - targetTimeSeconds);

    if (!isPlaying && drift > 0.05) {
      audioRef.current.currentTime = targetTimeSeconds;
    } else if (isPlaying && drift > 0.4) {
      audioRef.current.currentTime = targetTimeSeconds;
    }
  }, [currentTimeMs, isPlaying, clip]);

  // 2. Play/Pause Trigger
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(e => console.warn("Audio blocked:", e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, clip.id]);

  if (!audioAsset) return null;
  // FIX: Changed .url to .localUrl
  return <audio ref={audioRef} src={audioAsset.localUrl} />;
};


// --- MAIN STAGE ---
export const PreviewStage: React.FC = () => {
  const { timeline, currentTimeMs, isPlaying } = useEditorStore();
  const currentProject = useProjectStore((s: any) => s.currentProject);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const { activeVisualClip, activeAudioClips } = resolvePreviewState(timeline, currentTimeMs);
  const activeAsset = currentProject?.assets.find((a: any) => a.id === activeVisualClip?.asset_id);

  // 1. Video Scrubbing & Drift Sync
  useEffect(() => {
    if (videoRef.current && activeVisualClip && activeAsset?.type === "video") {
      const targetTimeSeconds = ((currentTimeMs - activeVisualClip.start_ms) + (activeVisualClip.source_offset_ms || 0)) / 1000;
      const drift = Math.abs(videoRef.current.currentTime - targetTimeSeconds);

      if (!isPlaying && drift > 0.05) {
        videoRef.current.currentTime = targetTimeSeconds;
      } else if (isPlaying && drift > 0.4) {
        videoRef.current.currentTime = targetTimeSeconds;
      }
    }
  }, [currentTimeMs, activeVisualClip, activeAsset, isPlaying]);

  // 2. Video Play/Pause Trigger
  useEffect(() => {
    if (videoRef.current && activeVisualClip && activeAsset?.type === "video") {
      if (isPlaying) {
        videoRef.current.play().catch(e => console.warn("Video blocked:", e));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, activeVisualClip?.id, activeAsset?.type]);

  return (
    <div className="relative flex flex-1 items-center justify-center bg-black overflow-hidden border-b border-[#24242b]">
      
      {!activeVisualClip && (
        <div className="text-gray-600 font-mono text-xs uppercase tracking-widest">No Media</div>
      )}

      {/* FIX: Changed .url to .localUrl */}
      {activeVisualClip && activeAsset?.type === "image" && (
        <img src={activeAsset.localUrl} alt={activeAsset.name} className="max-h-full max-w-full object-contain" />
      )}

      {/* FIX: Changed .url to .localUrl */}
      {activeVisualClip && activeAsset?.type === "video" && (
        <video 
          ref={videoRef}
          src={activeAsset.localUrl} 
          className="max-h-full max-w-full object-contain"
        />
      )}

      {/* Render the isolated invisible audio players */}
      {activeAudioClips.map(clip => (
        <AudioClipPlayer 
          key={clip.id} 
          clip={clip} 
          currentTimeMs={currentTimeMs} 
          isPlaying={isPlaying} 
        />
      ))}

      {activeVisualClip && (
        <div className="absolute top-4 left-4 bg-black/80 p-2 rounded text-[10px] text-green-400 font-mono z-10 pointer-events-none">
          [RENDER]: {activeAsset?.name} <br/>
          [START]: {activeVisualClip.start_ms}ms <br/>
          [LOCAL_TIME]: {currentTimeMs - activeVisualClip.start_ms}ms
        </div>
      )}
    </div>
  );
};