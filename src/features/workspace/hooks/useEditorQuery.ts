import { useEffect, useState } from "react";
import { getProjectEditor } from "../api/editorApi";
import { useEditorStore } from "../store/editorStore";
import { ensureMinimumTracks } from "../lib/timelineDefaults";

export function useEditorQuery(projectId: string | null) {
  const hydrateTimeline = useEditorStore((s) => s.hydrateTimeline);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    setIsLoading(true);
    setIsError(false);

    getProjectEditor(projectId)
      .then((data) => {
        const safeTimeline = ensureMinimumTracks(data.timeline);
        hydrateTimeline(safeTimeline);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsError(true);
        setIsLoading(false);
      });
  }, [projectId, hydrateTimeline]);

  return { isLoading, isError };
}