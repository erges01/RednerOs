import type { TimelineDocument, TimelineResponse } from "../types/editor";

export async function saveTimeline(projectId: string, timeline: TimelineDocument): Promise<TimelineResponse> {
  const res = await fetch(`/api/projects/${projectId}/timeline`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timeline }),
  });
  if (!res.ok) throw new Error("Failed to save timeline");
  return res.json();
}