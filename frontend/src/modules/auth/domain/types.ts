export interface User {
    id: string;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    avatarUrl?: string;
    roles?: string[];
}

export interface ApiToken {
    id: string;
    name: string;
    tokenPrefix: string;
    expiresAt?: string;
    createdAt: string;
}

export interface CreateApiTokenData {
    name: string;
    expiresAt?: string;
}

export interface CreateApiTokenResponse {
    id: string;
    name: string;
    token: string;
    tokenPrefix: string;
    expiresAt?: string;
}
