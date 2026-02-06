export interface PlatformUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    temporaryPassword?: string;
    role: {
        id: string;
        name: string;
        description: string;
        permissions: string[];
        userCount: number;
        users: any[];
        createdAt: string;
    };
    createdAt: string;
    lastLoginAt: string | null;
}

export interface PlatformUsersResponse {
    value: PlatformUser[];
    isSuccess: boolean;
    isFailure: boolean;
    error: string;
}

export interface CreatePlatformUserPayload {
    email: string;
    firstName: string;
    lastName: string;
    roleId: string;
}

export interface CreatePlatformUserResponse {
    value: PlatformUser;
    isSuccess: boolean;
    isFailure: boolean;
    error: string;
}
