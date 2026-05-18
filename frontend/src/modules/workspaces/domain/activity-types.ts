export interface WorkspaceActivity {
    id: string;
    workspaceId: string;
    actorId: string;
    actorName: string;
    action: string;
    entityType?: string;
    entityId?: string;
    entityTitle?: string;
    oldValue?: string;
    newValue?: string;
    createdAt: string;
}

export const ACTION_LABELS: Record<string, string> = {
    issue_created: 'creó la tarea',
    issue_updated: 'actualizó la tarea',
    issue_deleted: 'eliminó la tarea',
    cycle_created: 'creó el ciclo',
    cycle_updated: 'actualizó el ciclo',
    module_created: 'creó el módulo',
    company_created: 'creó la empresa',
    member_invited: 'invitó a un miembro',
    member_removed: 'eliminó a un miembro',
};
