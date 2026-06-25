import { v4 as uuidv4 } from "uuid";
import type { Clip } from "../types/editor";

export const createClipFromAsset = (
  asset: { id: string; name: string; type: string },
  trackId: string,
  startMs: number
): Clip => {
  return {
    id: uuidv4(),
    track_id: trackId,
    type: asset.type === "video" ? "video" : asset.type === "audio" ? "audio" : "image",
    start_ms: Math.round(startMs),
    duration_ms: 5000, // Default 5s
    source_offset_ms: 0,
    asset_id: asset.id,
    label: asset.name,
    color: null,
    // (Removed 'content: null' to match your strict types!)
  };
};