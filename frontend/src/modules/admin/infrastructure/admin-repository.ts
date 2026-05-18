import { apiClient } from '@/shared/lib/api-client';
import type { PagedResult } from '@/shared/types/pagination';
import type {
    AdminUserDto,
    InstanceConfig,
    UpdateInstanceConfigData,
    CreateAdminUserData,
    UpdateAdminUserData,
    AdminCompanyDto,
    AdminCompanyMemberDto,
    AdminAddCompanyMemberData,
    UpdateAdminCompanyData,
} from '../domain/types';

export const adminRepository = {
    getConfig: (): Promise<InstanceConfig> =>
        apiClient.get<InstanceConfig>('/api/admin/config').then((r) => r.data),
    updateConfig: (data: UpdateInstanceConfigData): Promise<InstanceConfig> =>
        apiClient.patch<InstanceConfig>('/api/admin/config', data).then((r) => r.data),
    getUsers: (page = 1): Promise<PagedResult<AdminUserDto>> =>
        apiClient.get<PagedResult<AdminUserDto>>(`/api/admin/users?page=${page}`).then((r) => r.data),
    createUser: (data: CreateAdminUserData): Promise<AdminUserDto> =>
        apiClient.post<AdminUserDto>('/api/admin/users', data).then((r) => r.data),
    updateUser: (id: string, data: UpdateAdminUserData): Promise<AdminUserDto> =>
        apiClient.put<AdminUserDto>(`/api/admin/users/${id}`, data).then((r) => r.data),
    deleteUser: (id: string): Promise<void> =>
        apiClient.delete(`/api/admin/users/${id}`).then(() => undefined),
    getCompanies: (page = 1): Promise<PagedResult<AdminCompanyDto>> =>
        apiClient.get<PagedResult<AdminCompanyDto>>(`/api/admin/companies?page=${page}`).then((r) => r.data),
    getCompanyMembers: (companyId: string): Promise<AdminCompanyMemberDto[]> =>
        apiClient.get<AdminCompanyMemberDto[]>(`/api/admin/companies/${companyId}/members`).then((r) => r.data),
    addCompanyMember: (companyId: string, data: AdminAddCompanyMemberData): Promise<AdminCompanyMemberDto> =>
        apiClient.post<AdminCompanyMemberDto>(`/api/admin/companies/${companyId}/members`, data).then((r) => r.data),
    removeCompanyMember: (companyId: string, userId: string): Promise<void> =>
        apiClient.delete(`/api/admin/companies/${companyId}/members/${userId}`).then(() => undefined),
    updateCompany: (id: string, data: UpdateAdminCompanyData): Promise<AdminCompanyDto> =>
        apiClient.patch<AdminCompanyDto>(`/api/admin/companies/${id}`, data).then((r) => r.data),
};
