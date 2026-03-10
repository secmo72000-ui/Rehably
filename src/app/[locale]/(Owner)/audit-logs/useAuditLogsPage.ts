import { useState, useCallback, useEffect } from 'react';
import { auditService, AuditLogDto } from '@/domains/audit';

export function useAuditLogsPage() {
    const [logs, setLogs] = useState<AuditLogDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Filters & Sorting
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const fetchLogs = useCallback(async (page: number, size: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await auditService.getLogs({
                page,
                pageSize: size,
                // add sorting if API supports
            });
            setLogs(response.items || []);
            setTotalPages(response.totalPages || 1);
            setTotalCount(response.totalCount || 0);
        } catch (err: any) {
            setError(err?.response?.data?.detail || err.message || 'Failed to fetch audit logs');
        } finally {
            setIsLoading(false);
        }
    }, [sortDirection]);

    useEffect(() => {
        fetchLogs(currentPage, pageSize);
    }, [fetchLogs, currentPage, pageSize]);

    const handleSort = () => {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        // Currently API doesn't mention sort param, but if it does, it will re-fetch
    };

    return {
        logs,
        isLoading,
        error,
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        totalPages,
        totalCount,
        sortDirection,
        handleSort,
        refetch: () => fetchLogs(currentPage, pageSize)
    };
}
