import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Workspace } from '../domain/types';

interface WorkspaceState {
    activeWorkspace: Workspace | null;
    setActiveWorkspace: (workspace: Workspace | null) => void;
    activeCompanyId: string | null;
    setActiveCompanyId: (id: string | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
    persist(
        (set) => ({
            activeWorkspace: null,
            setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
            activeCompanyId: null,
            setActiveCompanyId: (id) => set({ activeCompanyId: id }),
        }),
        { name: 'taskmanager-workspace' },
    ),
);
