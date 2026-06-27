import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { Asset, Project } from '../types';
import { StorageManager } from "../utils/storage";
import { MediaVault } from "../lib/mediaVault"; // <-- Import the new Vault

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
      // Layer A: Just load the lightweight JSON metadata for the menu
      const list = await StorageManager.loadAllProjects();
      set({ projectsList: list });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err) });
    }
  },

  createProject: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error("Failed to create project in the cloud backend");
      const dbProject = await res.json();

      const newProject: Project = {
        id: dbProject.id,
        name: dbProject.name,
        createdAt: dbProject.created_at,
        updatedAt: dbProject.updated_at,
        assets: [],
        timeline: [],
      };

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

  // --- THE HYDRATION ENGINE (ARMORED + AMNESIA FIX) ---
  openProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Get the JSON metadata
      const list = await StorageManager.loadAllProjects();
      const project = list.find((p) => p.id === id);
      if (!project) throw new Error("Project structure not found");

      // 2. Rehydrate all the dead media links from the Vault!
      const hydratedAssets = await Promise.all(
        project.assets.map(async (asset) => {
          try {
            // THE SHIELD: If this is an old ghost asset from yesterday, skip it!
            if (!asset.vaultKey) return asset; 

            // Ask Layer B for the raw file
            const blob = await MediaVault.getBlob(asset.vaultKey);
            if (blob) {
              // Create a fresh, working link for this exact session
              return { ...asset, localUrl: URL.createObjectURL(blob) };
            }
            return asset; // Return broken asset if file is somehow missing
          } catch (e) {
            console.error(`Failed to load asset ${asset.name} from vault`, e);
            return asset;
          }
        })
      );

      // 3. Inject the hydrated assets into the project state
      const hydratedProject = { ...project, assets: hydratedAssets };

      // --- THE AMNESIA FIX: Tell the browser to permanently remember this project ---
      localStorage.setItem("redner_last_project", id);

      set({ currentProject: hydratedProject, selectedAsset: null, isLoading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err), isLoading: false });
    }
  },

  deleteProject: async (id: string) => {
    try {
      // 1. Delete all heavy media blobs from the Vault
      const list = await StorageManager.loadAllProjects();
      const project = list.find((p) => p.id === id);
      if (project) {
        for (const asset of project.assets) {
          // THE SHIELD: Only delete from Vault if it actually has a vaultKey!
          if (asset.vaultKey) {
            await MediaVault.deleteBlob(asset.vaultKey);
          }
        }
      }

      // 2. Delete the JSON project wrapper
      await StorageManager.deleteProject(id);
      
      const { currentProject } = get();
      const isCurrent = currentProject?.id === id;
      
      // --- THE AMNESIA FIX: Forget the project if we just deleted it ---
      if (isCurrent) {
        localStorage.removeItem("redner_last_project");
      }

      set((state) => ({
        projectsList: state.projectsList.filter((p) => p.id !== id),
        currentProject: isCurrent ? null : currentProject,
        selectedAsset: isCurrent ? null : state.selectedAsset,
      }));
    } catch (err: unknown) {
      set({ error: getErrorMessage(err) });
    }
  },

  // --- THE UPLOAD ENGINE ---
  importAsset: async (file: File) => {
    const { currentProject } = get();
    if (!currentProject) return;

    let type: Asset["type"] = "image";
    if (file.type.startsWith("video/")) type = "video";
    else if (file.type.startsWith("audio/")) type = "audio";

    const assetId = uuidv4();
    const vaultKey = `vault_${assetId}`;

    try {
      // 1. Save the heavy file to IndexedDB FIRST
      await MediaVault.saveBlob(vaultKey, file, file.type);

      // 2. Create the temporary runtime link
      const localUrl = URL.createObjectURL(file);

      // 3. Create the JSON metadata pointer
      const newAsset: Asset = {
        id: assetId,
        name: file.name,
        type,
        size: file.size,
        vaultKey, // <-- The permanent pointer
        localUrl, // <-- The temporary link
        createdAt: new Date().toISOString(),
      };

      const updatedProject: Project = {
        ...currentProject,
        assets: [...currentProject.assets, newAsset],
        updatedAt: new Date().toISOString(),
      };

      // 4. Save the metadata to your JSON Storage
      await StorageManager.saveProject(updatedProject);
      
      set({ currentProject: updatedProject });
      await get().refreshProjectsList();
    } catch (err: unknown) {
      set({ error: getErrorMessage(err) });
    }
  },

  setSelectedAsset: (asset) => set({ selectedAsset: asset }),
}));