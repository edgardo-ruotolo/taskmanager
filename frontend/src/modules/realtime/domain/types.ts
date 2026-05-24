export type RealtimeEventType =
    | 'issue.created'
    | 'issue.updated'
    | 'issue.deleted'
    | 'comment.created'
    | 'comment.deleted'
    | 'reaction.changed'
    | 'subscriber.changed'
    | 'attachment.changed';

export interface RealtimeEvent {
    type: RealtimeEventType;
    workspaceSlug: string;
    projectId: string;
    entityId: string | null;
    actorId: string;
    at: string;
}
