import React, { useEffect, useRef } from "react";
import { 
  Folder, FolderPlus, HardDrive, Image, Music, Trash2, 
  Upload, Film, Search, Menu, PanelRight, PlaySquare
} from "lucide-react";
import { useProjectStore } from "../../stores/projectStore";
import { useEditorStore } from "./store/editorStore";
import { useEditorQuery } from "./hooks/useEditorQuery";
import { useTimelineAutosave } from "./hooks/useTimelineAutosave";
import { useAssetDrag } from "./hooks/useAssetDrag";
import { TimelineEditor } from "./components/TimelineEditor";
import { WorkspaceInspector } from "./components/WorkspaceInspector"; 
import { useTimelinePlayback } from "./hooks/useTimelinePlayback";
import { PreviewStage } from "./components/PreviewStage";
import { PreviewControls } from "./components/PreviewControls";
import { useEditorShortcuts } from "./hooks/useEditorShortcuts";

import { AIChatPanel } from "../ai/components/AIChatPanel";
import { useAIStore } from "../ai/store/aiStore";

export const WorkspaceLayout: React.FC = () => {
  const {
    projectsList, currentProject, selectedAsset, refreshProjectsList,
    createProject, openProject, deleteProject, importAsset, setSelectedAsset,
  } = useProjectStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isLoading, isError } = useEditorQuery(currentProject?.id || null);
  useTimelineAutosave(currentProject?.id || null);
  const { onDragStart } = useAssetDrag();
  useTimelinePlayback(); 
  useEditorShortcuts(); 
  
  const isSaving = useEditorStore(s => s.isSaving);
  const lastSavedAt = useEditorStore(s => s.lastSavedAt);
  
  const toggleAI = useAIStore((s) => s.togglePanel);
  const isAIOpen = useAIStore((s) => s.isOpen);

  useEffect(() => {
    refreshProjectsList();
    const lastId = localStorage.getItem("redner_last_project");
    if (lastId) openProject(lastId);
  }, [refreshProjectsList, openProject]);

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
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#1e1e1e] font-sans text-[#cccccc]">
      
      {/* --- VS CODE STYLE TITLE BAR --- */}
      <header className="flex h-10 shrink-0 items-center justify-between border-b border-[#2b2b2b] bg-[#181818] px-3 text-[13px]">
        {/* Left: Menu & App Name */}
        <div className="flex w-64 items-center gap-4">
          <Menu size={16} className="text-[#858585] hover:text-[#cccccc] cursor-pointer" />
          <div className="hidden items-center gap-3 md:flex text-[#cccccc]">
            <span className="cursor-pointer rounded px-2 py-1 hover:bg-[#333333]">File</span>
            <span className="cursor-pointer rounded px-2 py-1 hover:bg-[#333333]">Edit</span>
            <span className="cursor-pointer rounded px-2 py-1 hover:bg-[#333333]">View</span>
          </div>
        </div>

        {/* Center: The Command Palette / Search Bar */}
        <div className="flex h-6 w-96 max-w-full items-center justify-center rounded-md border border-[#3c3c3c] bg-[#1e1e1e] px-3 text-center text-xs text-[#858585] transition-colors hover:border-[#4d4d4d]">
          <Search size={12} className="mr-2" />
          <span className="truncate">
            {currentProject ? `Redner - ${currentProject.name}` : "Search or command"}
          </span>
        </div>

        {/* Right: Window Controls / Panel Toggles */}
        <div className="flex w-64 items-center justify-end gap-2">
          <button 
            onClick={toggleAI} 
            className={`flex items-center gap-1 rounded px-2 py-1 transition-colors ${
              isAIOpen ? "bg-[#333333] text-white" : "text-[#858585] hover:bg-[#333333] hover:text-[#cccccc]"
            }`}
            title="Toggle AI Co-Pilot"
          >
            <PanelRight size={16} />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        
        {/* --- VS CODE ACTIVITY BAR (FAR LEFT) --- */}
        <div className="flex w-12 shrink-0 flex-col items-center border-r border-[#2b2b2b] bg-[#181818] py-3 gap-6 text-[#858585]">
          <div className="relative group cursor-pointer text-white">
            <Folder size={24} strokeWidth={1.5} />
            <div className="absolute -left-3 top-0 h-full w-1 bg-[#007acc] rounded-r"></div>
          </div>
          <Film size={24} strokeWidth={1.5} className="cursor-pointer hover:text-white transition-colors" />
          
          {/* 🛠️ FIX: Removed the unsupported 'title' attribute */}
          <Upload 
            size={24} 
            strokeWidth={1.5} 
            onClick={() => fileInputRef.current?.click()} 
            className="cursor-pointer hover:text-white transition-colors mt-auto mb-2" 
          />
        </div>

        {/* --- VS CODE EXPLORER SIDEBAR --- */}
        <aside className="flex w-60 shrink-0 flex-col border-r border-[#2b2b2b] bg-[#252526]">
          <div className="flex items-center justify-between px-4 py-3 text-[11px] font-semibold text-[#cccccc]">
            <span>EXPLORER</span>
            <button onClick={handleCreatePrompt} className="text-[#858585] hover:text-white" title="New Project">
              <FolderPlus size={14} />
            </button>
          </div>
          
          {/* Projects Folder */}
          <div className="flex h-1/2 flex-col border-b border-[#2b2b2b]">
            <div className="px-4 py-1 text-[10px] font-bold tracking-wider text-[#858585]">PROJECTS</div>
            <div className="flex-1 space-y-[1px] overflow-y-auto px-2 pb-2">
              {projectsList.length === 0 ? (
                <div className="mt-4 px-2 text-[11px] text-[#858585]">No workspace folder open.</div>
              ) : (
                projectsList.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => openProject(project.id)}
                    className={`group flex cursor-pointer items-center justify-between rounded-sm px-2 py-1 text-[13px] transition ${
                      currentProject?.id === project.id ? "bg-[#37373d] text-white" : "text-[#cccccc] hover:bg-[#2a2d2e]"
                    }`}
                  >
                    <span className="truncate flex items-center gap-2">
                      <PlaySquare size={13} className={currentProject?.id === project.id ? "text-[#007acc]" : "text-[#858585]"} />
                      {project.name}
                    </span>
                    <button
                      onClick={(event) => { event.stopPropagation(); deleteProject(project.id); }}
                      className="p-0.5 text-[#858585] opacity-0 transition hover:text-white group-hover:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Assets Folder */}
          <div className="flex flex-1 flex-col">
            <div className="px-4 py-2 text-[10px] font-bold tracking-wider text-[#858585]">ASSET BIN</div>
            <div className="flex-1 space-y-[1px] overflow-y-auto px-2">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="video/*,audio/*,image/*" />
              {currentProject?.assets.length ? (
                currentProject.assets.map((asset) => (
                  <div
                    key={asset.id}
                    draggable 
                    onDragStart={(e) => onDragStart(e, asset)} 
                    onClick={() => setSelectedAsset(asset)}
                    className={`flex cursor-pointer items-center gap-2 truncate rounded-sm px-2 py-1 text-[13px] transition active:cursor-grabbing ${
                      selectedAsset?.id === asset.id ? "bg-[#37373d] text-white" : "text-[#cccccc] hover:bg-[#2a2d2e]"
                    }`}
                  >
                    {asset.type === "video" && <Film size={13} className="text-[#4e94ce]" />}
                    {asset.type === "audio" && <Music size={13} className="text-[#d7ba7d]" />}
                    {asset.type === "image" && <Image size={13} className="text-[#4ec9b0]" />}
                    <span className="truncate">{asset.name}</span>
                  </div>
                ))
              ) : (
                <div className="mt-4 px-2 text-[11px] text-[#858585]">
                  {currentProject ? "No assets inside folder." : ""}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* --- MAIN EDITOR CANVAS --- */}
        <main className="flex flex-1 flex-col overflow-hidden bg-[#1e1e1e]">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-[#858585] text-sm">Loading workspace...</div>
          ) : isError ? (
            <div className="flex h-full items-center justify-center text-[#f14c4c] text-sm">Failed to attach to runtime.</div>
          ) : !currentProject ? (
            <div className="flex h-full items-center justify-center text-[#858585] text-sm">
              <div className="text-center">
                <PlaySquare size={48} className="mx-auto mb-4 opacity-20" />
                <p>Select a project to open the editor</p>
              </div>
            </div>
          ) : (
            <>
              <PreviewStage />
              <PreviewControls />
              <div className="flex h-[45%] min-h-[300px] flex-col overflow-hidden border-t border-[#2b2b2b]">
                <TimelineEditor />
              </div>
            </>
          )}
        </main>

        <WorkspaceInspector />
        <AIChatPanel />
      </div>

      {/* --- VS CODE STATUS BAR --- */}
      <footer className="flex h-6 shrink-0 items-center justify-between bg-[#007acc] px-3 text-[11px] font-medium text-white">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 cursor-pointer hover:bg-white/20 px-1 rounded transition-colors">
            <HardDrive size={12} />
            <span>Redner Engine Local</span>
          </div>
          <span className="cursor-pointer hover:bg-white/20 px-1 rounded transition-colors">Rust Backend Connected</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="cursor-pointer hover:bg-white/20 px-1 rounded transition-colors">UTF-8</span>
          <span className="cursor-pointer hover:bg-white/20 px-1 rounded transition-colors">TypeScript React</span>
          <span className="flex items-center gap-1 cursor-pointer hover:bg-white/20 px-1 rounded transition-colors">
            {isSaving ? "Syncing..." : lastSavedAt ? "Synced ☁️" : "Idle"}
          </span>
        </div>
      </footer>
    </div>
  );
};