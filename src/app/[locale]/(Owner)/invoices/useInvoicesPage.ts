import { useState, useEffect, useCallback } from 'react';
import { invoicesService, AdminInvoice } from '@/domains/invoices';

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
        } catch (err: any) {
            setError(err?.response?.data?.error?.message || err?.response?.data?.detail || err.message);
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
        } catch (err: any) {
            setError(err?.response?.data?.error?.message || err.message);
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
        } catch (err: any) {
            setError(err?.response?.data?.error?.message || 'Failed to download PDF');
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
