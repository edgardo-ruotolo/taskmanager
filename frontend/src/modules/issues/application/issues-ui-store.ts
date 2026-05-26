import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface IssuesUiState {
    expandedGroups: Record<string, boolean>;
    toggleGroupExpanded: (key: string) => void;
    // Sub-issue tree expansion (ephemeral — not persisted)
    expandedIssueIds: Set<string>;
    toggleExpanded: (issueId: string) => void;
    isExpanded: (issueId: string) => boolean;
    collapseAll: () => void;
}

export const useIssuesUiStore = create<IssuesUiState>()(
    persist(
        (set, get) => ({
            expandedGroups: {},
            toggleGroupExpanded: (key) =>
                set((s) => ({
                    expandedGroups: {
                        ...s.expandedGroups,
                        [key]: !(s.expandedGroups[key] ?? true),
                    },
                })),
            // Sub-issue expansion state — ephemeral, not serialised by persist
            expandedIssueIds: new Set<string>(),
            toggleExpanded: (issueId) =>
                set((s) => {
                    const next = new Set(s.expandedIssueIds);
                    if (next.has(issueId)) {
                        next.delete(issueId);
                    } else {
                        next.add(issueId);
                    }
                    return { expandedIssueIds: next };
                }),
            isExpanded: (issueId) => get().expandedIssueIds.has(issueId),
            collapseAll: () => set({ expandedIssueIds: new Set<string>() }),
        }),
        {
            name: 'tm-issues-groups',
            // Only persist expandedGroups; expandedIssueIds is session-only
            partialize: (state) => ({ expandedGroups: state.expandedGroups }),
        },
    ),
);
