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
    getById: (workspaceSlug: string, companyId: string, issueId: string): Promise<Issue> =>
        apiClient
            .get<Issue>(
                `/api/workspaces/${workspaceSlug}/companies/${companyId}/issues/${issueId}`,
            )
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
