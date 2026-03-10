export interface AuditLogDto {
    id: string;
    timestamp: string;
    actionType: string;
    clinicId: string | null;
    clinicName: string | null;
    packageName: string | null;
    userId: string;
    userEmail: string | null;
    userRole: string | null;
    entityName: string;
    entityId: string;
    ipAddress: string | null;
    userAgent: string | null;
    details: string | null;
    isSuccess: boolean;
    otpReference: string | null;
}

export interface AuditLogsResponse {
    items: AuditLogDto[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export interface GetAuditLogsParams {
    clinicId?: string;
    userId?: string;
    actionType?: number;
    role?: string;
    email?: string;
    isSuccess?: boolean;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
}
