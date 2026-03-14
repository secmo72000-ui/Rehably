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

// Platform permission matrix from /api/admin/permissions/platform
export interface PlatformPermissionAction {
    action: string;       // e.g., "view"
    permission: string;   // e.g., "clinics.view"
    nameEn: string;       // e.g., "View"
    nameAr: string;       // e.g., "قراءة"
}

export interface PlatformPermissionResource {
    resource: string;     // e.g., "clinics"
    nameEn: string;       // e.g., "Clinic Management"
    nameAr: string;       // e.g., "ادارة العيادات"
    actions: PlatformPermissionAction[];
}

export interface PlatformPermissionMatrix {
    resources: PlatformPermissionResource[];
}
