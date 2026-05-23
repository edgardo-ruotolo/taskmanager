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

export interface AdminWorkspaceDto {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    ownerId: string;
    createdAt: string;
}

export interface AdminWorkspaceMemberDto {
    userId: string;
    email: string;
    displayName?: string;
    role: string;
}

export interface AdminAddWorkspaceMemberData {
    userId: string;
    role: 'Admin' | 'Member';
}

export interface CreateAdminWorkspaceData {
    name: string;
    slug?: string;
    description?: string;
}

export interface UpdateAdminWorkspaceData {
    name?: string;
    description?: string;
    logoUrl?: string;
}
