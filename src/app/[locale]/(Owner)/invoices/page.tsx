'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';
import { Table, Drawer, type TableColumn } from '@/ui/components';
import { InvoiceDetails } from './_components';
import { useInvoicesPage } from './useInvoicesPage';
import { AdminInvoice, getPaymentStatusKey } from '@/domains/invoices';
import Image from 'next/image';

export default function InvoicesPage() {
    const params = useParams();
    const locale = params.locale as Locale;
    const t = (key: string) => getTranslation(locale, `invoices.${key}`);

    const {
        invoices,
        isLoading,
        error,
        currentPage,
        setCurrentPage,
        totalPages,
        sortDirection,
        handleSort,
        handleDelete,
        handleDownloadPdf,
    } = useInvoicesPage();

    const [selectedInvoice, setSelectedInvoice] = useState<AdminInvoice | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const statusConfig = {
        paid: { label: t('status.paid'), color: 'bg-confirm-50 text-confirm-600' },
        rejected: { label: t('status.rejected'), color: 'bg-error-50 text-error-600' },
        pending: { label: t('status.pending'), color: 'bg-warning-50 text-warning-600' },
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString(locale === 'ar' ? 'en-GB' : locale);
        } catch {
            return dateStr;
        }
    };

    const columns: TableColumn<AdminInvoice>[] = [
        { key: 'invoiceNumber', header: 'ID' },
        { key: 'clinicName', header: t('columns.clinicName') || 'اسم العيادة' },
        { key: 'packageName', header: 'Package' },
        {
            key: 'paidAt' as any,
            header: t('columns.paymentDate') || 'تاريخ الدفع',
            render: (_, invoice) => invoice.paidAt ? formatDate(invoice.paidAt) : '-',
        },
        {
            key: 'dueDate',
            header: t('columns.dueDate') || 'معتاد إلى',
            render: (_, invoice) => formatDate(invoice.dueDate),
        },
        {
            key: 'transactionType',
            header: t('columns.paymentMethod') || 'طريقة الدفع',
            render: (_, invoice) => invoice.transactionType || '-',
        },
        {
            key: 'totalAmount',
            header: t('columns.amountPaid') || 'المبلغ المدفوع',
            render: (_, invoice) => `${invoice.totalAmount} ${invoice.currency}`,
        },
        {
            key: 'paymentStatus',
            header: t('columns.status') || 'حالة الدفع',
            render: (_, invoice) => {
                const statusKey = getPaymentStatusKey(invoice.paymentStatus);
                const config = statusConfig[statusKey];
                return (
                    <span className={`px-3 py-1 rounded-full text-sm-medium ${config.color}`}>
                        {config.label}
                    </span>
                );
            },
        },
        {
            key: 'id' as any,
            header: t('columns.printInvoice') || 'طباعة الفاتورة',
            render: (_, invoice) => (
                <button
                    onClick={() => {
                        setSelectedInvoice(invoice);
                        setIsDrawerOpen(true);
                    }}
                    className="text-Primary-500 hover:underline text-sm-medium"
                >
                    {t('columns.printInvoice') || 'طباعة الفاتورة'}
                </button>
            ),
        },
    ];

    if (locale === 'ar') {
        columns.reverse();
    }

    return (
        <div className="space-y-6">

            {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-lg">
                    {error}
                </div>
            )}

            <Table
                data={invoices}
                columns={columns}
                rowKey="id"
                title={t('pageTitle')}
                emptyMessage={t('noData') || 'لا توجد فواتير'}
                loading={isLoading}
                sorting={{
                    active: true,
                    direction: sortDirection,
                    onToggle: handleSort,
                }}
                pagination={{
                    currentPage,
                    totalPages,
                    onPageChange: setCurrentPage,
                }}
                rowActions={(invoice) => (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                setSelectedInvoice(invoice);
                                setIsDrawerOpen(true);
                            }}
                            className="p-2 hover:bg-grey-100 rounded-lg transition-colors"
                            title={t('viewInvoice') || 'عرض الفاتورة'}
                        >
                            <Image
                                src="/shered/table/eye.svg"
                                alt="View"
                                width={20}
                                height={20}
                            />
                        </button>
                        <button
                            onClick={() => handleDelete(invoice.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title={t('deleteInvoice') || 'حذف'}
                        >
                            <Image
                                src="/shered/trash.svg"
                                alt="Delete"
                                width={20}
                                height={20}
                            />
                        </button>
                    </div>
                )}
                actionsHeader={t('columns.actions') || 'تفاصيل'}
            />

            {selectedInvoice && (
                <Drawer
                    isOpen={isDrawerOpen}
                    onClose={() => {
                        setIsDrawerOpen(false);
                        setSelectedInvoice(null);
                    }}
                    title={
                        <Image
                            src="/Admin/Navbar/logo.svg"
                            alt="Rehably"
                            width={200}
                            height={40}
                        />
                    }
                    size="lg"
                >
                    <InvoiceDetails
                        invoice={selectedInvoice}
                        onDownloadPdf={() => handleDownloadPdf(selectedInvoice.id, selectedInvoice.invoiceNumber)}
                    />
                </Drawer>
            )}
        </div>
    );
}
