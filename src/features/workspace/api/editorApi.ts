import type { ProjectEditorResponse } from "../types/editor";

export async function getProjectEditor(projectId: string): Promise<ProjectEditorResponse> {
  const res = await fetch(`/api/projects/${projectId}/editor`);
  if (!res.ok) throw new Error("Failed to load editor payload");
  return res.json();
}