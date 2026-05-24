import { useEffect } from 'react';
import { HubConnectionState } from '@microsoft/signalr';
import { useQueryClient } from '@tanstack/react-query';
import { useSignalRConnection } from '@/shared/hooks/useSignalRConnection';
import { useAuthMe } from '@/modules/auth/application/use-auth-me';
import { issuesKey } from '@/modules/issues/application/use-issues';
import {
    issueDetailKey,
    commentsKey,
    reactionsKey,
    activitiesKey,
    subscribersKey,
} from '@/modules/issues/application/use-issue-detail';
import type { RealtimeEvent } from '../domain/types';

export const useRealtimeProject = (workspaceSlug: string, projectId: string): void => {
    const queryClient = useQueryClient();
    const { data: me } = useAuthMe();
    const currentUserId = me?.id ?? '';

    const enabled = Boolean(workspaceSlug && projectId);
    const { connection, connectionState } = useSignalRConnection('/hubs/issues', enabled);

    useEffect(() => {
        if (!connection || connectionState !== HubConnectionState.Connected || !enabled) {
            return;
        }

        let joined = false;

        const handler = (evt: RealtimeEvent): void => {
            if (evt.actorId === currentUserId) return;

            switch (evt.type) {
                case 'issue.created':
                case 'issue.updated':
                case 'issue.deleted':
                    void queryClient.invalidateQueries({ queryKey: issuesKey(workspaceSlug, projectId) });
                    if (evt.entityId) {
                        void queryClient.invalidateQueries({
                            queryKey: issueDetailKey(workspaceSlug, projectId, evt.entityId),
                        });
                        void queryClient.invalidateQueries({
                            queryKey: activitiesKey(workspaceSlug, projectId, evt.entityId),
                        });
                    }
                    break;
                case 'comment.created':
                case 'comment.deleted':
                    if (evt.entityId) {
                        void queryClient.invalidateQueries({
                            queryKey: commentsKey(workspaceSlug, projectId, evt.entityId),
                        });
                        void queryClient.invalidateQueries({
                            queryKey: activitiesKey(workspaceSlug, projectId, evt.entityId),
                        });
                    }
                    break;
                case 'reaction.changed':
                    if (evt.entityId) {
                        void queryClient.invalidateQueries({
                            queryKey: reactionsKey(workspaceSlug, projectId, evt.entityId),
                        });
                    }
                    break;
                case 'subscriber.changed':
                    if (evt.entityId) {
                        void queryClient.invalidateQueries({
                            queryKey: subscribersKey(workspaceSlug, projectId, evt.entityId),
                        });
                    }
                    break;
                case 'attachment.changed':
                    if (evt.entityId) {
                        void queryClient.invalidateQueries({
                            queryKey: ['files', 'issue', evt.entityId],
                        });
                    }
                    break;
                default:
                    break;
            }
        };

        connection.on('RealtimeEvent', handler);

        connection
            .invoke('JoinProjectGroup', projectId)
            .then(() => {
                joined = true;
            })
            .catch(() => undefined);

        const handleReconnected = (): void => {
            void connection.invoke('JoinProjectGroup', projectId).catch(() => undefined);
            void queryClient.invalidateQueries({ queryKey: issuesKey(workspaceSlug, projectId) });
        };
        connection.onreconnected(handleReconnected);

        return () => {
            connection.off('RealtimeEvent', handler);
            if (joined) {
                connection.invoke('LeaveProjectGroup', projectId).catch(() => undefined);
            }
        };
    }, [connection, connectionState, enabled, workspaceSlug, projectId, currentUserId, queryClient]);
};
