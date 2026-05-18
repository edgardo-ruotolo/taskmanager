import { apiClient } from '@/shared/lib/api-client';
import type { PagedResult } from '@/shared/types/pagination';
import type { Company, CreateCompanyData, UpdateCompanyData } from '../domain/types';

export const companyRepository = {
    getAll: (workspaceSlug: string): Promise<PagedResult<Company>> =>
        apiClient
            .get<PagedResult<Company>>(`/api/workspaces/${workspaceSlug}/companies`)
            .then((r) => r.data),
    getById: (workspaceSlug: string, companyId: string): Promise<Company> =>
        apiClient
            .get<Company>(`/api/workspaces/${workspaceSlug}/companies/${companyId}`)
            .then((r) => r.data),
    create: (workspaceSlug: string, data: CreateCompanyData): Promise<Company> =>
        apiClient
            .post<Company>(`/api/workspaces/${workspaceSlug}/companies`, data)
            .then((r) => r.data),
    update: (workspaceSlug: string, companyId: string, data: UpdateCompanyData): Promise<Company> =>
        apiClient
            .put<Company>(`/api/workspaces/${workspaceSlug}/companies/${companyId}`, data)
            .then((r) => r.data),
    delete: (workspaceSlug: string, companyId: string): Promise<void> =>
        apiClient
            .delete(`/api/workspaces/${workspaceSlug}/companies/${companyId}`)
            .then(() => undefined),
};
