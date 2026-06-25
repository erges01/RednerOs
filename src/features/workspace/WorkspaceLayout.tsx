import React, { useEffect, useRef } from "react";
import { Folder, FolderPlus, HardDrive, Image, Music, Trash2, Upload, Film } from "lucide-react";
import { useProjectStore } from "../../stores/projectStore";
import { useEditorStore } from "./store/editorStore";
import { useEditorQuery } from "./hooks/useEditorQuery";
import { useTimelineAutosave } from "./hooks/useTimelineAutosave";
import { useAssetDrag } from "./hooks/useAssetDrag";
import { TimelineEditor } from "./components/TimelineEditor";
import { WorkspaceInspector } from "./components/WorkspaceInspector"; // <-- NEW: Imported the Inspector

export const WorkspaceLayout: React.FC = () => {
  const {
    projectsList, currentProject, selectedAsset, refreshProjectsList,
    createProject, openProject, deleteProject, importAsset, setSelectedAsset,
  } = useProjectStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Editor Engine Hooks ---
  const { isLoading, isError } = useEditorQuery(currentProject?.id || null);
  useTimelineAutosave(currentProject?.id || null);
  const { onDragStart } = useAssetDrag();
  
  const isSaving = useEditorStore(s => s.isSaving);
  const lastSavedAt = useEditorStore(s => s.lastSavedAt);
  // ---------------------------

  useEffect(() => {
    refreshProjectsList();
  }, [refreshProjectsList]);

  const handleCreatePrompt = () => {
    const name = prompt("Enter Project Name:");
    if (name) createProject(name);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importAsset(file);
      e.target.value = "";
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#0c0c0e] font-sans text-gray-200">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#24242b] bg-[#141416] px-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-black tracking-widest text-red-500">REDNER STUDIO</span>
          <span className="rounded bg-[#24242b] px-2 py-0.5 text-[10px] font-mono text-gray-400">WEB-CORE v1.0</span>
        </div>
        <div className="text-xs font-medium text-gray-400">
          {currentProject ? `Editing: ${currentProject.name}` : "No project opened"}
        </div>
        <button onClick={handleCreatePrompt} className="flex items-center gap-2 rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700">
          <FolderPlus size={14} /> New Project
        </button>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="flex w-64 shrink-0 flex-col border-r border-[#24242b] bg-[#111113]">
          <div className="flex items-center gap-2 border-b border-[#24242b] p-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            <Folder size={13} /> Projects
          </div>
          <div className="flex h-1/2 flex-col">
            <div className="flex-1 space-y-1 overflow-y-auto border-b border-[#24242b] p-2">
              {projectsList.length === 0 ? (
                <div className="mt-6 px-4 text-center text-[11px] text-gray-600">No projects yet. Create your first workspace.</div>
              ) : (
                projectsList.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => openProject(project.id)}
                    className={`group flex cursor-pointer items-center justify-between rounded p-2 text-xs transition ${
                      currentProject?.id === project.id ? "border border-red-800 bg-red-950/40 text-red-200" : "bg-[#18181c] hover:bg-[#202026]"
                    }`}
                  >
                    <span className="truncate pr-2">{project.name}</span>
                    <button
                      onClick={(event) => { event.stopPropagation(); deleteProject(project.id); }}
                      className="p-0.5 text-gray-500 opacity-0 transition hover:text-red-400 group-hover:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-[#24242b] p-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            <span className="flex items-center gap-2"><Film size={13} /> Asset Bin</span>
            {currentProject && (
              <button onClick={() => fileInputRef.current?.click()} className="rounded p-1 text-gray-400 transition hover:bg-[#24242b] hover:text-white">
                <Upload size={13} />
              </button>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="video/*,audio/*,image/*" />
          </div>
          <div className="flex-1 space-y-1 overflow-y-auto p-2">
            {currentProject?.assets.length ? (
              currentProject.assets.map((asset) => (
                <div
                  key={asset.id}
                  draggable 
                  onDragStart={(e) => onDragStart(e, asset)} 
                  onClick={() => setSelectedAsset(asset)}
                  className={`flex cursor-pointer items-center gap-2 truncate rounded border p-2 text-xs transition active:cursor-grabbing ${
                    selectedAsset?.id === asset.id ? "border-gray-500 bg-[#24242b] text-white" : "border-transparent bg-[#18181c] hover:bg-[#202026]"
                  }`}
                >
                  {asset.type === "video" && <Film size={12} className="text-gray-400" />}
                  {asset.type === "audio" && <Music size={12} className="text-gray-400" />}
                  {asset.type === "image" && <Image size={12} className="text-gray-400" />}
                  <span className="truncate">{asset.name}</span>
                </div>
              ))
            ) : (
              <div className="mt-6 px-4 text-center text-[11px] text-gray-600">
                {currentProject ? "No assets yet. Upload media to populate the bin." : "Open a project to see assets."}
              </div>
            )}
          </div>
        </aside>

        {/* --- The Real Canvas Stage --- */}
        <main className="flex flex-1 flex-col overflow-hidden bg-[#161619]">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-gray-500 text-sm">Loading timeline from Rust...</div>
          ) : isError ? (
            <div className="flex h-full items-center justify-center text-red-500 text-sm">Failed to load timeline. Check backend.</div>
          ) : !currentProject ? (
            <div className="flex h-full items-center justify-center text-gray-600 text-sm">Select a project to start editing</div>
          ) : (
            <TimelineEditor />
          )}
        </main>

        {/* --- NEW: THE DYNAMIC INSPECTOR --- */}
        <WorkspaceInspector />

      </div>

      <footer className="flex h-6 shrink-0 items-center justify-between border-t border-[#24242b] bg-[#0a0a0c] px-4 text-[10px] font-mono text-gray-500">
        <div className="flex items-center gap-2">
          <HardDrive size={11} />
          <span>Local Sandbox Sync Active</span>
        </div>
        <div>Status: {isSaving ? <span className="text-yellow-500">Saving to Cloud...</span> : lastSavedAt ? <span className="text-green-500">Saved</span> : "Idle"}</div>
      </footer>
    </div>
  );
};