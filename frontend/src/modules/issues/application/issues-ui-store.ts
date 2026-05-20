import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface IssuesUiState {
    expandedGroups: Record<string, boolean>;
    toggleGroupExpanded: (key: string) => void;
}

export const useIssuesUiStore = create<IssuesUiState>()(
    persist(
        (set) => ({
            expandedGroups: {},
            toggleGroupExpanded: (key) =>
                set((s) => ({
                    expandedGroups: {
                        ...s.expandedGroups,
                        [key]: !(s.expandedGroups[key] ?? true),
                    },
                })),
        }),
        { name: 'tm-issues-groups' },
    ),
);
