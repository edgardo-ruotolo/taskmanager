import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
    primaryWidth: number;
    collapsed: boolean;
    pinnedWorkspaceItems: string[];
    mobileSidebarOpen: boolean;
    expandedProjects: Record<string, boolean>;
    setPrimaryWidth: (width: number) => void;
    setCollapsed: (collapsed: boolean) => void;
    toggleCollapsed: () => void;
    togglePinnedItem: (id: string) => void;
    setMobileSidebarOpen: (open: boolean) => void;
    toggleMobileSidebar: () => void;
    toggleProjectExpanded: (projectId: string) => void;
    expandProject: (projectId: string) => void;
}

export const useSidebarStore = create<SidebarState>()(
    persist(
        (set) => ({
            primaryWidth: 220,
            collapsed: false,
            pinnedWorkspaceItems: ['views', 'analytics'],
            mobileSidebarOpen: false,
            expandedProjects: {},
            setPrimaryWidth: (width) => set({ primaryWidth: width }),
            setCollapsed: (collapsed) => set({ collapsed }),
            toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
            togglePinnedItem: (id) =>
                set((s) => ({
                    pinnedWorkspaceItems: s.pinnedWorkspaceItems.includes(id)
                        ? s.pinnedWorkspaceItems.filter((i) => i !== id)
                        : [...s.pinnedWorkspaceItems, id],
                })),
            setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
            toggleMobileSidebar: () => set((s) => ({ mobileSidebarOpen: !s.mobileSidebarOpen })),
            toggleProjectExpanded: (projectId) =>
                set((s) => ({
                    expandedProjects: {
                        ...s.expandedProjects,
                        [projectId]: !s.expandedProjects[projectId],
                    },
                })),
            expandProject: (projectId) =>
                set((s) =>
                    s.expandedProjects[projectId]
                        ? s
                        : { expandedProjects: { ...s.expandedProjects, [projectId]: true } },
                ),
        }),
        { name: 'tm-primary-sidebar' },
    ),
);
