export interface InstanceConfig {
    id: string;
    instanceName: string;
    isSignUpEnabled: boolean;
    isSetupDone: boolean;
    adminEmail?: string;
}

export interface UpdateInstanceConfigData {
    instanceName?: string;
    isSignUpEnabled?: boolean;
    adminEmail?: string;
    brevoApiKey?: string;
    cloudinaryCloudName?: string;
    cloudinaryApiKey?: string;
    cloudinaryApiSecret?: string;
}

export interface AdminUserDto {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    isActive: boolean;
    roles: string[];
    createdAt: string;
}

export interface CreateAdminUserData {
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    password: string;
    role: string;
}

export interface UpdateAdminUserData {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    isActive?: boolean;
    role?: string;
}

export interface AdminCompanyDto {
    id: string;
    name: string;
    identifier: string;
    description?: string;
    workspaceId: string;
    workspaceName: string;
    ownerId: string;
    memberCount: number;
    createdAt: string;
    stateGroupId: string;
    stateGroupName: string;
}

export interface AdminCompanyMemberDto {
    userId: string;
    email: string;
    displayName?: string;
    role: string;
}

export interface AdminAddCompanyMemberData {
    userId: string;
    role: string;
}

export interface UpdateAdminCompanyData {
    name?: string;
    description?: string;
    stateGroupId?: string;
}
