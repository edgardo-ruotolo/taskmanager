import { apiClient } from '@/shared/lib/api-client';
import type { PagedResult } from '@/shared/types/pagination';
import type {
    RecurringTemplate,
    RecurringRun,
    RecurringPreview,
    RecurringFromIssuePrefill,
    RecurringFrequency,
    RecurringListParams,
    CreateRecurringTemplateData,
    UpdateRecurringTemplateData,
} from '../domain/types';

const base = (slug: string): string => `/api/workspaces/${slug}/recurring`;

const FREQUENCY_PASCAL: Record<string, RecurringFrequency> = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly',
    Daily: 'Daily',
    Weekly: 'Weekly',
    Monthly: 'Monthly',
    Quarterly: 'Quarterly',
    Yearly: 'Yearly',
};

const normalizeFrequency = (value: string): RecurringFrequency => {
    const mapped = FREQUENCY_PASCAL[value];
    return mapped ?? 'Daily';
};

const normalizeTemplate = (template: RecurringTemplate): RecurringTemplate => ({
    ...template,
    frequency: normalizeFrequency(template.frequency as unknown as string),
    cycleId: template.cycleId ?? null,
    cycle: template.cycle ?? null,
    projects: template.projects ?? [],
    assignees: template.assignees ?? [],
});

export const recurringRepository = {
    getAll: async (
        workspaceSlug: string,
        params: RecurringListParams = {},
    ): Promise<PagedResult<RecurringTemplate>> => {
        const query: Record<string, string | number> = {};
        if (params.page) query.page = params.page;
        if (params.pageSize) query.pageSize = params.pageSize;
        if (params.search) query.search = params.search;
        if (params.frequency) query.frequency = params.frequency;
        if (params.status) query.status = params.status;

        const response = await apiClient.get<PagedResult<RecurringTemplate>>(base(workspaceSlug), {
            params: query,
        });
        return {
            ...response.data,
            items: response.data.items.map(normalizeTemplate),
        };
    },

    getOne: async (workspaceSlug: string, id: string): Promise<RecurringTemplate> => {
        const response = await apiClient.get<RecurringTemplate>(`${base(workspaceSlug)}/${id}`);
        return normalizeTemplate(response.data);
    },

    create: async (
        workspaceSlug: string,
        data: CreateRecurringTemplateData,
    ): Promise<RecurringTemplate> => {
        const response = await apiClient.post<RecurringTemplate>(base(workspaceSlug), data);
        return normalizeTemplate(response.data);
    },

    update: async (
        workspaceSlug: string,
        id: string,
        data: UpdateRecurringTemplateData,
    ): Promise<RecurringTemplate> => {
        const response = await apiClient.patch<RecurringTemplate>(
            `${base(workspaceSlug)}/${id}`,
            data,
        );
        return normalizeTemplate(response.data);
    },

    delete: (workspaceSlug: string, id: string): Promise<void> =>
        apiClient.delete(`${base(workspaceSlug)}/${id}`).then(() => undefined),

    getRuns: (workspaceSlug: string, id: string): Promise<RecurringRun[]> =>
        apiClient.get<RecurringRun[]>(`${base(workspaceSlug)}/${id}/runs`).then((r) => r.data),

    preview: (workspaceSlug: string, id: string, count = 5): Promise<RecurringPreview> =>
        apiClient
            .get<RecurringPreview>(`${base(workspaceSlug)}/${id}/preview`, { params: { count } })
            .then((r) => r.data),

    pause: async (workspaceSlug: string, id: string): Promise<RecurringTemplate> => {
        const response = await apiClient.post<RecurringTemplate>(`${base(workspaceSlug)}/${id}/pause`);
        return normalizeTemplate(response.data);
    },

    resume: async (workspaceSlug: string, id: string): Promise<RecurringTemplate> => {
        const response = await apiClient.post<RecurringTemplate>(`${base(workspaceSlug)}/${id}/resume`);
        return normalizeTemplate(response.data);
    },

    skipNext: async (workspaceSlug: string, id: string): Promise<RecurringTemplate> => {
        const response = await apiClient.post<RecurringTemplate>(
            `${base(workspaceSlug)}/${id}/skip-next`,
        );
        return normalizeTemplate(response.data);
    },

    runNow: (workspaceSlug: string, id: string): Promise<void> =>
        apiClient.post(`${base(workspaceSlug)}/${id}/run-now`).then(() => undefined),

    duplicate: async (workspaceSlug: string, id: string): Promise<RecurringTemplate> => {
        const response = await apiClient.post<RecurringTemplate>(
            `${base(workspaceSlug)}/${id}/duplicate`,
        );
        return normalizeTemplate(response.data);
    },

    fromIssue: (workspaceSlug: string, issueId: string): Promise<RecurringFromIssuePrefill> =>
        apiClient
            .post<RecurringFromIssuePrefill>(`${base(workspaceSlug)}/from-issue/${issueId}`)
            .then((r) => r.data),
};
