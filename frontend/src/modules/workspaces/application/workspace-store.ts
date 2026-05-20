import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Workspace } from '../domain/types';

interface WorkspaceState {
    activeWorkspaceId: string | null;
    setActiveWorkspaceId: (id: string | null) => void;
    /** @deprecated Pass the workspace object — only the id is persisted. Prefer setActiveWorkspaceId. */
    setActiveWorkspace: (workspace: Workspace | null) => void;
    activeCompanyId: string | null;
    setActiveCompanyId: (id: string | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
    persist(
        (set) => ({
            activeWorkspaceId: null,
            setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),
            setActiveWorkspace: (workspace) => set({ activeWorkspaceId: workspace?.id ?? null }),
            activeCompanyId: null,
            setActiveCompanyId: (id) => set({ activeCompanyId: id }),
        }),
        {
            name: 'taskmanager-workspace',
            partialize: (state) => ({
                activeWorkspaceId: state.activeWorkspaceId,
                activeCompanyId: state.activeCompanyId,
            }),
        },
    ),
);
