import { useQuery } from '@tanstack/react-query';
import { analyticsRepository } from '../infrastructure/analytics-repository';

export const useAnalyticsOverview = (workspaceSlug: string) =>
    useQuery({
        queryKey: ['analytics', 'overview', workspaceSlug],
        queryFn: () => analyticsRepository.getOverview(workspaceSlug),
        enabled: !!workspaceSlug,
    });
