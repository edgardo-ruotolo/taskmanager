import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
    primaryWidth: number;
    collapsed: boolean;
    pinnedWorkspaceItems: string[];
    mobileSidebarOpen: boolean;
    expandedCompanies: Record<string, boolean>;
    setPrimaryWidth: (width: number) => void;
    setCollapsed: (collapsed: boolean) => void;
    toggleCollapsed: () => void;
    togglePinnedItem: (id: string) => void;
    setMobileSidebarOpen: (open: boolean) => void;
    toggleMobileSidebar: () => void;
    toggleCompanyExpanded: (companyId: string) => void;
    expandCompany: (companyId: string) => void;
}

export const useSidebarStore = create<SidebarState>()(
    persist(
        (set) => ({
            primaryWidth: 220,
            collapsed: false,
            pinnedWorkspaceItems: ['views', 'analytics'],
            mobileSidebarOpen: false,
            expandedCompanies: {},
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
            toggleCompanyExpanded: (companyId) =>
                set((s) => ({
                    expandedCompanies: {
                        ...s.expandedCompanies,
                        [companyId]: !s.expandedCompanies[companyId],
                    },
                })),
            expandCompany: (companyId) =>
                set((s) =>
                    s.expandedCompanies[companyId]
                        ? s
                        : { expandedCompanies: { ...s.expandedCompanies, [companyId]: true } },
                ),
        }),
        { name: 'tm-primary-sidebar' },
    ),
);
