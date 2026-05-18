import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
    primaryWidth: number;
    collapsed: boolean;
    pinnedWorkspaceItems: string[];
    setPrimaryWidth: (width: number) => void;
    setCollapsed: (collapsed: boolean) => void;
    toggleCollapsed: () => void;
    togglePinnedItem: (id: string) => void;
}

export const useSidebarStore = create<SidebarState>()(
    persist(
        (set) => ({
            primaryWidth: 220,
            collapsed: false,
            pinnedWorkspaceItems: ['views', 'analytics'],
            setPrimaryWidth: (width) => set({ primaryWidth: width }),
            setCollapsed: (collapsed) => set({ collapsed }),
            toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
            togglePinnedItem: (id) =>
                set((s) => ({
                    pinnedWorkspaceItems: s.pinnedWorkspaceItems.includes(id)
                        ? s.pinnedWorkspaceItems.filter((i) => i !== id)
                        : [...s.pinnedWorkspaceItems, id],
                })),
        }),
        { name: 'tm-primary-sidebar' },
    ),
);
