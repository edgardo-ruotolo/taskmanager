import { apiClient } from '@/shared/lib/api-client';
import type { PagedResult } from '@/shared/types/pagination';
import type {
    Issue,
    CreateIssueData,
    UpdateIssueData,
    IssueComment,
    IssueReaction,
    IssueActivity,
    CreateCommentData,
    CreateReactionData,
    IssueView,
    CreateIssueViewData,
    IssueType,
    CreateIssueTypeData,
    IssueSubscriber,
    IssueLink,
    CreateIssueLinkData,
    IssueRelation,
    CreateIssueRelationData,
    IssueVersion,
    IssueMention,
    IssueTemplate,
    CreateIssueTemplateData,
    SearchSimilarIssuesData,
} from '../domain/types';

export const issueRepository = {
    getAll: (workspaceSlug: string, companyId: string): Promise<PagedResult<Issue>> =>
        apiClient
            .get<PagedResult<Issue>>(
                `/api/workspaces/${workspaceSlug}/companies/${companyId}/issues`,
            )
            .then((r) => r.data),
    create: (
        workspaceSlug: string,
        companyId: string,
        data: CreateIssueData,
    ): Promise<Issue> =>
        apiClient
            .post<Issue>(
                `/api/workspaces/${workspaceSlug}/companies/${companyId}/issues`,
                data,
            )
            .then((r) => r.data),
    update: (
        workspaceSlug: string,
        companyId: string,
        issueId: string,
        data: UpdateIssueData,
    ): Promise<Issue> =>
        apiClient
            .patch<Issue>(
                `/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}`,
                data,
            )
            .then((r) => r.data),
    delete: (workspaceSlug: string, companyId: string, issueId: string): Promise<void> =>
        apiClient
            .delete(
                `/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}`,
            )
            .then(() => undefined),
    approve: (
        workspaceSlug: string,
        companyId: string,
        issueId: string,
        targetStateId: string,
    ): Promise<Issue> =>
        apiClient
            .post<Issue>(
                `/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}/approve`,
                { targetStateId },
            )
            .then((r) => r.data),
    getById: (workspaceSlug: string, companyId: string, issueId: string): Promise<Issue> =>
        apiClient
            .get<Issue>(
                `/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}`,
            )
            .then((r) => r.data),
    archive: (workspaceSlug: string, companyId: string, issueId: string): Promise<void> =>
        apiClient
            .post(`/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}/archive`)
            .then(() => undefined),
    duplicate: (workspaceSlug: string, companyId: string, issueId: string): Promise<Issue> =>
        apiClient
            .post<Issue>(`/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}/duplicate`)
            .then((r) => r.data),
};

// Comments
export const getComments = (
    workspaceSlug: string,
    companyId: string,
    issueId: string,
): Promise<IssueComment[]> =>
    apiClient
        .get<IssueComment[]>(
            `/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}/comments`,
        )
        .then((r) => r.data);

export const createComment = (
    workspaceSlug: string,
    companyId: string,
    issueId: string,
    data: CreateCommentData,
): Promise<IssueComment> =>
    apiClient
        .post<IssueComment>(
            `/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}/comments`,
            data,
        )
        .then((r) => r.data);

export const updateComment = (
    workspaceSlug: string,
    companyId: string,
    issueId: string,
    commentId: string,
    data: { body: string },
): Promise<IssueComment> =>
    apiClient
        .patch<IssueComment>(
            `/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}/comments/${commentId}`,
            data,
        )
        .then((r) => r.data);

export const deleteComment = (
    workspaceSlug: string,
    companyId: string,
    issueId: string,
    commentId: string,
): Promise<void> =>
    apiClient
        .delete(
            `/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}/comments/${commentId}`,
        )
        .then(() => undefined);

// Reactions
export const getReactions = (
    workspaceSlug: string,
    companyId: string,
    issueId: string,
): Promise<IssueReaction[]> =>
    apiClient
        .get<IssueReaction[]>(
            `/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}/reactions`,
        )
        .then((r) => r.data);

export const addReaction = (
    workspaceSlug: string,
    companyId: string,
    issueId: string,
    data: CreateReactionData,
): Promise<IssueReaction> =>
    apiClient
        .post<IssueReaction>(
            `/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}/reactions`,
            data,
        )
        .then((r) => r.data);

export const removeReaction = (
    workspaceSlug: string,
    companyId: string,
    issueId: string,
    emoji: string,
): Promise<void> =>
    apiClient
        .delete(
            `/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}/reactions/${encodeURIComponent(emoji)}`,
        )
        .then(() => undefined);

// Views
export const getViews = (workspaceSlug: string): Promise<IssueView[]> =>
    apiClient
        .get<IssueView[]>(`/api/workspaces/${workspaceSlug}/views`)
        .then((r) => r.data);

export const createView = (
    workspaceSlug: string,
    data: CreateIssueViewData,
): Promise<IssueView> =>
    apiClient
        .post<IssueView>(`/api/workspaces/${workspaceSlug}/views`, data)
        .then((r) => r.data);

export const deleteView = (workspaceSlug: string, viewId: string): Promise<void> =>
    apiClient
        .delete(`/api/workspaces/${workspaceSlug}/views/${viewId}`)
        .then(() => undefined);

// Issue Types
export const getIssueTypes = (workspaceSlug: string): Promise<IssueType[]> =>
    apiClient
        .get<IssueType[]>(`/api/workspaces/${workspaceSlug}/issue-types`)
        .then((r) => r.data);

export const createIssueType = (
    workspaceSlug: string,
    data: CreateIssueTypeData,
): Promise<IssueType> =>
    apiClient
        .post<IssueType>(`/api/workspaces/${workspaceSlug}/issue-types`, data)
        .then((r) => r.data);

export const deleteIssueType = (workspaceSlug: string, id: string): Promise<void> =>
    apiClient
        .delete(`/api/workspaces/${workspaceSlug}/issue-types/${id}`)
        .then(() => undefined);

// Subscribers
export const getSubscribers = (
    workspaceSlug: string,
    companyId: string,
    issueId: string,
): Promise<IssueSubscriber[]> =>
    apiClient
        .get<IssueSubscriber[]>(
            `/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}/subscribers`,
        )
        .then((r) => r.data);

export const subscribe = (
    workspaceSlug: string,
    companyId: string,
    issueId: string,
): Promise<void> =>
    apiClient
        .post(
            `/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}/subscribers`,
            {},
        )
        .then(() => undefined);

export const unsubscribe = (
    workspaceSlug: string,
    companyId: string,
    issueId: string,
): Promise<void> =>
    apiClient
        .delete(
            `/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}/subscribers`,
        )
        .then(() => undefined);

// Links
export const getLinks = (
    workspaceSlug: string,
    companyId: string,
    issueId: string,
): Promise<IssueLink[]> =>
    apiClient
        .get<IssueLink[]>(
            `/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}/links`,
        )
        .then((r) => r.data);

export const createLink = (
    workspaceSlug: string,
    companyId: string,
    issueId: string,
    data: CreateIssueLinkData,
): Promise<IssueLink> =>
    apiClient
        .post<IssueLink>(
            `/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}/links`,
            data,
        )
        .then((r) => r.data);

export const deleteLink = (
    workspaceSlug: string,
    companyId: string,
    issueId: string,
    linkId: string,
): Promise<void> =>
    apiClient
        .delete(
            `/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}/links/${linkId}`,
        )
        .then(() => undefined);

// Relations
export const getRelations = (
    workspaceSlug: string,
    companyId: string,
    issueId: string,
): Promise<IssueRelation[]> =>
    apiClient
        .get<IssueRelation[]>(
            `/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}/relations`,
        )
        .then((r) => r.data);

export const createRelation = (
    workspaceSlug: string,
    companyId: string,
    issueId: string,
    data: CreateIssueRelationData,
): Promise<IssueRelation> =>
    apiClient
        .post<IssueRelation>(
            `/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}/relations`,
            data,
        )
        .then((r) => r.data);

export const deleteRelation = (
    workspaceSlug: string,
    companyId: string,
    issueId: string,
    relationId: string,
): Promise<void> =>
    apiClient
        .delete(
            `/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}/relations/${relationId}`,
        )
        .then(() => undefined);

// Activity
export const getActivities = (
    workspaceSlug: string,
    companyId: string,
    issueId: string,
): Promise<IssueActivity[]> =>
    apiClient
        .get<IssueActivity[]>(
            `/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}/activities`,
        )
        .then((r) => r.data);

// DeDupe — search similar
export const searchSimilarIssues = (
    workspaceSlug: string,
    companyId: string,
    data: SearchSimilarIssuesData,
): Promise<Issue[]> =>
    apiClient
        .post<Issue[]>(
            `/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/search-similar`,
            data,
        )
        .then((r) => r.data);

// Cycle
export const attachCycle = (
    workspaceSlug: string,
    companyId: string,
    issueId: string,
    cycleId: string,
): Promise<void> =>
    apiClient
        .post(`/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}/cycle`, { cycleId })
        .then(() => undefined);

export const detachCycle = (
    workspaceSlug: string,
    companyId: string,
    issueId: string,
): Promise<void> =>
    apiClient
        .delete(`/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}/cycle`)
        .then(() => undefined);

// Modules
export const attachModules = (
    workspaceSlug: string,
    companyId: string,
    issueId: string,
    moduleIds: string[],
): Promise<void> =>
    apiClient
        .post(`/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}/modules`, { moduleIds })
        .then(() => undefined);

export const detachModule = (
    workspaceSlug: string,
    companyId: string,
    issueId: string,
    moduleId: string,
): Promise<void> =>
    apiClient
        .delete(`/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}/modules/${moduleId}`)
        .then(() => undefined);

// Attachments
export const getAttachments = (
    workspaceSlug: string,
    companyId: string,
    issueId: string,
): Promise<Array<{ id: string; fileName: string; contentType: string; sizeBytes: number; url: string; createdAt: string }>> =>
    apiClient
        .get(`/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}/attachments`)
        .then((r) => r.data);

export const uploadAttachment = (
    workspaceSlug: string,
    companyId: string,
    issueId: string,
    file: File,
): Promise<{ id: string; fileName: string; url: string }> => {
    const form = new FormData();
    form.append('file', file);
    return apiClient
        .post(
            `/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}/attachments`,
            form,
            { headers: { 'Content-Type': 'multipart/form-data' } },
        )
        .then((r) => r.data);
};

export const deleteAttachment = (
    workspaceSlug: string,
    companyId: string,
    attachmentId: string,
): Promise<void> =>
    apiClient
        .delete(`/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/attachments/${attachmentId}`)
        .then(() => undefined);

// Mentions
export const getMentions = (
    workspaceSlug: string,
    companyId: string,
    issueId: string,
): Promise<IssueMention[]> =>
    apiClient
        .get<IssueMention[]>(
            `/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}/mentions`,
        )
        .then((r) => r.data);

export const syncMentions = (
    workspaceSlug: string,
    companyId: string,
    issueId: string,
    mentionedUserIds: string[],
): Promise<void> =>
    apiClient
        .post(
            `/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}/mentions`,
            { mentionedUserIds },
        )
        .then(() => undefined);

// Versions
export const getVersions = (
    workspaceSlug: string,
    companyId: string,
    issueId: string,
): Promise<IssueVersion[]> =>
    apiClient
        .get<IssueVersion[]>(
            `/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}/versions`,
        )
        .then((r) => r.data);

// Templates
export const getTemplates = (workspaceSlug: string): Promise<IssueTemplate[]> =>
    apiClient
        .get<IssueTemplate[]>(`/api/workspaces/${workspaceSlug}/templates`)
        .then((r) => r.data);

export const createTemplate = (
    workspaceSlug: string,
    data: CreateIssueTemplateData,
): Promise<IssueTemplate> =>
    apiClient
        .post<IssueTemplate>(`/api/workspaces/${workspaceSlug}/templates`, data)
        .then((r) => r.data);

export const updateTemplate = (
    workspaceSlug: string,
    templateId: string,
    data: CreateIssueTemplateData,
): Promise<IssueTemplate> =>
    apiClient
        .patch<IssueTemplate>(`/api/workspaces/${workspaceSlug}/templates/${templateId}`, data)
        .then((r) => r.data);

export const deleteTemplate = (workspaceSlug: string, templateId: string): Promise<void> =>
    apiClient
        .delete(`/api/workspaces/${workspaceSlug}/templates/${templateId}`)
        .then(() => undefined);
