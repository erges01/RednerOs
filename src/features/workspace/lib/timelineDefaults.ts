import type { TimelineDocument } from "../types/editor";

export function ensureMinimumTracks(timeline: TimelineDocument): TimelineDocument {
  if (timeline.tracks && timeline.tracks.length > 0) return timeline;

  return {
    ...timeline,
    tracks: [
      { id: "track_video_1", name: "Video Track 1", type: "video", order: 0, clips: [] },
      { id: "track_audio_1", name: "Audio Track 1", type: "audio", order: 1, clips: [] },
    ],
  };
}