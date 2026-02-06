export interface PlatformUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    role: {
        id: string;
        name: string;
    };
    createdAt: string;
    lastLoginAt?: string;
    // Phone is not in API spec, but adding as optional if returned or for future
    phoneNumber?: string;
}

export interface CreateUserPayload {
    email: string;
    firstName: string;
    lastName: string;
    roleId: string;
}

export interface UpdateUserPayload {
    firstName?: string;
    lastName?: string;
    isActive?: boolean;
}

export interface PlatformUsersResponse {
    success: boolean;
    data: PlatformUser[];
}

export interface UserResponse {
    success: boolean;
    data: PlatformUser;
}
