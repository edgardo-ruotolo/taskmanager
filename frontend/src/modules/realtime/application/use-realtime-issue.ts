import { useEffect } from 'react';
import { HubConnectionState } from '@microsoft/signalr';
import { useQueryClient } from '@tanstack/react-query';
import { useSignalRConnection } from '@/shared/hooks/useSignalRConnection';
import { useAuthMe } from '@/modules/auth/application/use-auth-me';
import {
    issueDetailKey,
    commentsKey,
    reactionsKey,
    activitiesKey,
    subscribersKey,
} from '@/modules/issues/application/use-issue-detail';
import type { RealtimeEvent } from '../domain/types';

export const useRealtimeIssue = (
    workspaceSlug: string,
    projectId: string,
    issueId: string,
): void => {
    const queryClient = useQueryClient();
    const { data: me } = useAuthMe();
    const currentUserId = me?.id ?? '';

    const enabled = Boolean(workspaceSlug && projectId && issueId);
    const { connection, connectionState } = useSignalRConnection('/hubs/issues', enabled);

    useEffect(() => {
        if (!connection || connectionState !== HubConnectionState.Connected || !enabled) {
            return;
        }

        let joined = false;

        const handler = (evt: RealtimeEvent): void => {
            if (evt.entityId !== issueId) return;
            if (evt.actorId === currentUserId) return;

            switch (evt.type) {
                case 'issue.updated':
                case 'issue.deleted':
                    void queryClient.invalidateQueries({
                        queryKey: issueDetailKey(workspaceSlug, projectId, issueId),
                    });
                    void queryClient.invalidateQueries({
                        queryKey: activitiesKey(workspaceSlug, projectId, issueId),
                    });
                    break;
                case 'comment.created':
                case 'comment.deleted':
                    void queryClient.invalidateQueries({
                        queryKey: commentsKey(workspaceSlug, projectId, issueId),
                    });
                    void queryClient.invalidateQueries({
                        queryKey: activitiesKey(workspaceSlug, projectId, issueId),
                    });
                    break;
                case 'reaction.changed':
                    void queryClient.invalidateQueries({
                        queryKey: reactionsKey(workspaceSlug, projectId, issueId),
                    });
                    break;
                case 'subscriber.changed':
                    void queryClient.invalidateQueries({
                        queryKey: subscribersKey(workspaceSlug, projectId, issueId),
                    });
                    break;
                case 'attachment.changed':
                    void queryClient.invalidateQueries({
                        queryKey: ['files', 'issue', issueId],
                    });
                    break;
                default:
                    break;
            }
        };

        connection.on('RealtimeEvent', handler);

        connection
            .invoke('JoinIssueGroup', issueId)
            .then(() => {
                joined = true;
            })
            .catch(() => undefined);

        const handleReconnected = (): void => {
            void connection.invoke('JoinIssueGroup', issueId).catch(() => undefined);
            void queryClient.invalidateQueries({
                queryKey: issueDetailKey(workspaceSlug, projectId, issueId),
            });
        };
        connection.onreconnected(handleReconnected);

        return () => {
            connection.off('RealtimeEvent', handler);
            if (joined) {
                connection.invoke('LeaveIssueGroup', issueId).catch(() => undefined);
            }
        };
    }, [connection, connectionState, enabled, workspaceSlug, projectId, issueId, currentUserId, queryClient]);
};
