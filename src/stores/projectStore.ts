import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { Asset, Project } from '../types';
import { StorageManager } from "../utils/storage";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "Unexpected error";
};

interface ProjectState {
  projectsList: Project[];
  currentProject: Project | null;
  selectedAsset: Asset | null;
  isLoading: boolean;
  error: string | null;
  refreshProjectsList: () => Promise<void>;
  createProject: (name: string) => Promise<void>;
  openProject: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  importAsset: (file: File) => Promise<void>;
  setSelectedAsset: (asset: Asset | null) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projectsList: [],
  currentProject: null,
  selectedAsset: null,
  isLoading: false,
  error: null,

  refreshProjectsList: async () => {
    try {
      const list = await StorageManager.loadAllProjects();
      set({ projectsList: list });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err) });
    }
  },

  createProject: async (name: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // --- NEW: Tell Rust to create the project in NeonDB ---
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        throw new Error("Failed to create project in the cloud backend");
      }

      // Rust returns the newly created project with the real DB UUID
      const dbProject = await res.json();

      // Format it to match your local Project interface
      const newProject: Project = {
        id: dbProject.id,
        name: dbProject.name,
        createdAt: dbProject.created_at,
        updatedAt: dbProject.updated_at,
        assets: [],
        timeline: [],
      };
      // --------------------------------------------------------

      // Save to your local sandbox so your UI stays exactly the same
      await StorageManager.saveProject(newProject);
      
      set((state) => ({
        currentProject: newProject,
        selectedAsset: null,
        projectsList: [...state.projectsList, newProject],
        isLoading: false,
      }));
    } catch (err: unknown) {
      set({ error: getErrorMessage(err), isLoading: false });
    }
  },

  openProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const list = await StorageManager.loadAllProjects();
      const project = list.find((p) => p.id === id);
      if (!project) throw new Error("Project structure not found");
      set({ currentProject: project, selectedAsset: null, isLoading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err), isLoading: false });
    }
  },

  deleteProject: async (id: string) => {
    try {
      await StorageManager.deleteProject(id);
      const { currentProject } = get();
      const isCurrent = currentProject?.id === id;
      set((state) => ({
        projectsList: state.projectsList.filter((p) => p.id !== id),
        currentProject: isCurrent ? null : currentProject,
        selectedAsset: isCurrent ? null : state.selectedAsset,
      }));
    } catch (err: unknown) {
      set({ error: getErrorMessage(err) });
    }
  },

  importAsset: async (file: File) => {
    const { currentProject } = get();
    if (!currentProject) return;

    let type: Asset["type"] = "image";
    if (file.type.startsWith("video/")) type = "video";
    else if (file.type.startsWith("audio/")) type = "audio";

    const localUrl = URL.createObjectURL(file);

    const newAsset: Asset = {
      id: uuidv4(),
      name: file.name,
      type,
      localUrl,
      size: file.size,
      createdAt: new Date().toISOString(),
    };

    const updatedProject: Project = {
      ...currentProject,
      assets: [...currentProject.assets, newAsset],
      updatedAt: new Date().toISOString(),
    };

    try {
      await StorageManager.saveProject(updatedProject);
      set({ currentProject: updatedProject });
      await get().refreshProjectsList();
    } catch (err: unknown) {
      set({ error: getErrorMessage(err) });
    }
  },

  setSelectedAsset: (asset) => set({ selectedAsset: asset }),
}));