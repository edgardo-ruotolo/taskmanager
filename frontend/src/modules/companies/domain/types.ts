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
