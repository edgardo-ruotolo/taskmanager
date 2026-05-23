import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Workspace } from '../domain/types';

interface WorkspaceState {
    activeWorkspaceId: string | null;
    setActiveWorkspaceId: (id: string | null) => void;
    /** @deprecated Pass the workspace object — only the id is persisted. Prefer setActiveWorkspaceId. */
    setActiveWorkspace: (workspace: Workspace | null) => void;
    activeProjectId: string | null;
    setActiveProjectId: (id: string | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
    persist(
        (set) => ({
            activeWorkspaceId: null,
            setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),
            setActiveWorkspace: (workspace) => set({ activeWorkspaceId: workspace?.id ?? null }),
            activeProjectId: null,
            setActiveProjectId: (id) => set({ activeProjectId: id }),
        }),
        {
            name: 'taskmanager-workspace',
            partialize: (state) => ({
                activeWorkspaceId: state.activeWorkspaceId,
                activeProjectId: state.activeProjectId,
            }),
        },
    ),
);
