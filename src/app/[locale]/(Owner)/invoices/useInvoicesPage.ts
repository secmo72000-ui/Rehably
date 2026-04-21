import { useState, useEffect, useCallback } from 'react';
import { invoicesService, AdminInvoice } from '@/domains/invoices';
import { getApiError } from '@/shared/utils';

export function useInvoicesPage() {
    const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const fetchInvoices = useCallback(async (page: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await invoicesService.getAll({ page, pageSize: 20 });
            setInvoices(response.items || []);
            setTotalPages(response.totalPages || 1);
        } catch (err) {
            setError(getApiError(err, 'Failed to fetch invoices'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInvoices(currentPage);
    }, [fetchInvoices, currentPage]);

    const handleSort = () => {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    const handleDelete = async (id: string) => {
        try {
            await invoicesService.delete(id);
            setInvoices(prev => prev.filter(inv => inv.id !== id));
        } catch (err) {
            setError(getApiError(err, 'Failed to delete invoice'));
        }
    };

    const handleDownloadPdf = async (id: string, invoiceNumber: string) => {
        try {
            const blob = await invoicesService.downloadPdf(id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `invoice-${invoiceNumber}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError(getApiError(err, 'Failed to download PDF'));
        }
    };

    const sortedInvoices = [...invoices].sort((a, b) => {
        const timeA = new Date(a.dueDate).getTime();
        const timeB = new Date(b.dueDate).getTime();
        return sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
    });

    return {
        invoices: sortedInvoices,
        isLoading,
        error,
        currentPage,
        setCurrentPage,
        totalPages,
        sortDirection,
        handleSort,
        handleDelete,
        handleDownloadPdf,
    };
}
