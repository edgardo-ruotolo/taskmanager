import type { Workspace } from '../domain/types';
import { useWorkspaceStore } from './workspace-store';
import { useWorkspaces } from './use-workspaces';

export const useActiveWorkspace = (): Workspace | null => {
    const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
    const { data } = useWorkspaces();
    if (!activeWorkspaceId || !data) return null;
    return data.items.find((w) => w.id === activeWorkspaceId) ?? null;
};
