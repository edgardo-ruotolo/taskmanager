import { useQuery } from '@tanstack/react-query';
import { activityRepository } from '../infrastructure/activity-repository';

export const useWorkspaceActivity = (workspaceSlug: string, page = 1) =>
    useQuery({
        queryKey: ['workspace-activity', workspaceSlug, page],
        queryFn: () => activityRepository.getAll(workspaceSlug, page),
        enabled: !!workspaceSlug,
        // Activity feed is real-time critical.
        staleTime: 0,
        refetchOnWindowFocus: true,
    });
