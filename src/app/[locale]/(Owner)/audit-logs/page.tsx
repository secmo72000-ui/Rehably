'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';
import { Table, type TableColumn } from '@/ui/components';

import { useAuditLogsPage } from './useAuditLogsPage';
import { AuditLogDto } from '@/domains/audit';

function formatDetails(val: unknown): string {
    if (!val || typeof val !== 'string') return '-';
    try {
        const parsed = JSON.parse(val);
        if (typeof parsed === 'object' && parsed !== null) {
            return Object.entries(parsed)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ');
        }
        return String(parsed);
    } catch {
        return val;
    }
}

function parseUserAgent(ua: string | null): string {
    if (!ua) return '-';
    let browser = 'Unknown';
    let os = 'Unknown';

    if (ua.includes('Edg/') || ua.includes('Edge/')) browser = 'Edge';
    else if (ua.includes('Chrome/')) browser = 'Chrome';
    else if (ua.includes('Firefox/')) browser = 'Firefox';
    else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari';
    else if (ua.includes('MSIE') || ua.includes('Trident/')) browser = 'IE';

    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac OS X')) os = 'macOS';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    return `${browser} - ${os}`;
}

// ========== Page Component ==========
export default function AuditLogsPage() {
    const params = useParams();
    const locale = params.locale as Locale;
    const t = (key: string) => getTranslation(locale, `auditLogs.${key}`);

    const {
        logs,
        isLoading,
        error,
        currentPage,
        setCurrentPage,
        totalPages,
        sortDirection,
        handleSort,
    } = useAuditLogsPage();

    // Table columns
    const columns: TableColumn<AuditLogDto>[] = [
        {
            key: 'isSuccess', header: t('columns.status'), render: (val) => (
                <div className="flex justify-center">
                    <span className={`px-4 py-1.5 rounded text-sm font-semibold max-w-fit mx-auto ${val ? 'bg-[#E6F6EC] text-[#039855]' : 'bg-[#FEEBED] text-[#D92D20]'}`}>
                        {val ? t('status.success') || (locale === 'ar' ? 'ناجح' : 'Success') : t('status.failed') || (locale === 'ar' ? 'فشل' : 'Failed')}
                    </span>
                </div>
            )
        },
        { key: 'actionType', header: t('columns.actionType'), render: (val) => val || '-' },
        { key: 'entityName', header: t('columns.category'), render: (val) => val || '-' },
        { key: 'date_key' as any, header: t('columns.date'), render: (_, row) => new Date(row.timestamp).toLocaleDateString(locale === 'ar' ? 'en-GB' : locale) },
        { key: 'time_key' as any, header: t('columns.time'), render: (_, row) => new Date(row.timestamp).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) },
        {
            key: 'userEmail', header: t('columns.userEmail'), render: (val) => (
                <div className="flex justify-center items-center">
                    <span className="underline decoration-1 underline-offset-4 text-gray-700 block max-w-[150px] truncate text-center leading-tight">
                        {val ? (val as string).replace('@', '\n@') : '-'}
                    </span>
                </div>
            )
        },
        { key: 'userRole', header: t('columns.userRole'), render: (val) => val || '-' },
        { key: 'clinicName', header: t('columns.clinicName'), render: (val) => val || '-' },
        { key: 'userAgent', header: t('columns.browserOs'), render: (val) => parseUserAgent(val as string) },
        { key: 'id', header: t('columns.id'), render: (val) => String(val).substring(14, 21).toUpperCase() },
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

            {/* Table */}
            <Table
                data={logs}
                columns={columns}
                rowKey="id"
                title={t('pageTitle')}
                emptyMessage={t('noData')}
                sorting={{
                    active: true,
                    direction: sortDirection,
                    onToggle: handleSort
                }}
                pagination={{
                    currentPage,
                    totalPages,
                    onPageChange: setCurrentPage,
                }}
            />
        </div>
    );
}
