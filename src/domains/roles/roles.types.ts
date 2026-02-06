// Permission structure from /api/admin/permissions
export interface Permission {
    name: string;      // e.g., "clinics.view"
    resource: string;  // e.g., "clinics"
    action: string;    // e.g., "view"
}

// Response from /api/admin/permissions
export interface PermissionResponse {
    items: Permission[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
}

// Role structure
export interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string[]; // e.g., ["clinics.view", "clinics.create"]
    userCount: number;
    users?: { id: string; name: string; email: string }[];
    createdAt?: string;
}

// Response from /api/admin/roles
export interface RolesResponse {
    value: Role[];
    isSuccess: boolean;
}

// Payload for creating a role
export interface CreateRolePayload {
    name: string;
    description?: string;
    permissions: string[];
}

export interface UpdateRolePayload {
    description?: string;
    permissions: string[];
}
