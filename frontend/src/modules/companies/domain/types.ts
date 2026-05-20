export type CompanyRole = 'Guest' | 'Member' | 'Lead' | 'Admin';

export interface CompanyMember {
    userId: string;
    companyId: string;
    role: CompanyRole;
    displayName?: string;
    email?: string;
}

export interface Company {
    id: string;
    name: string;
    identifier: string;
    description?: string;
    logoUrl?: string;
    workspaceId: string;
    ownerId: string;
    createdAt: string;
}

export interface CreateCompanyData {
    name: string;
    identifier: string;
    description?: string;
}

export interface UpdateCompanyData {
    name: string;
    description?: string;
}
