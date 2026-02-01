'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';
import { Table, type TableColumn, Drawer } from '@/ui/components';
import { AuditLogDetails } from './components';
import Image from 'next/image';

// ========== Types ==========
interface AuditLog {
    id: string;
    clinicName: string;
    package: string;
    managerName: string;
    email: string;
    loginDate: string;
    failedLogins: number;
    users: number;
    storage: string;
    [key: string]: string | number;
}

// ========== Mock Data ==========
const mockAuditLogs: AuditLog[] = [
    {
        id: 'Sub-10',
        clinicName: 'أحمد منصور',
        package: 'Package-1',
        managerName: 'info@gmail.com',
        email: 'info@gmail.com',
        loginDate: '01/03/2025',
        failedLogins: 231,
        users: 21,
        storage: '50جيجا/100جيجا',
    },
    {
        id: 'Sub-11',
        clinicName: 'أحمد منصور',
        package: 'Package-1',
        managerName: 'info@gmail.com',
        email: 'info@gmail.com',
        loginDate: '01/03/2025',
        failedLogins: 231,
        users: 21,
        storage: '50جيجا/100جيجا',
    },
    {
        id: 'Sub-12',
        clinicName: 'أحمد منصور',
        package: 'Package-1',
        managerName: 'info@gmail.com',
        email: 'info@gmail.com',
        loginDate: '01/03/2025',
        failedLogins: 231,
        users: 21,
        storage: '50جيجا/100جيجا',
    },
    {
        id: 'Sub-13',
        clinicName: 'أحمد منصور',
        package: 'Package-1',
        managerName: 'info@gmail.com',
        email: 'info@gmail.com',
        loginDate: '01/03/2025',
        failedLogins: 231,
        users: 21,
        storage: '50جيجا/100جيجا',
    },
    {
        id: 'Sub-14',
        clinicName: 'أحمد منصور',
        package: 'Package-1',
        managerName: 'info@gmail.com',
        email: 'info@gmail.com',
        loginDate: '01/03/2025',
        failedLogins: 231,
        users: 21,
        storage: '50جيجا/100جيجا',
    },
    {
        id: 'Sub-15',
        clinicName: 'أحمد منصور',
        package: 'Package-1',
        managerName: 'info@gmail.com',
        email: 'info@gmail.com',
        loginDate: '01/03/2025',
        failedLogins: 231,
        users: 21,
        storage: '50جيجا/100جيجا',
    },
    {
        id: 'Sub-16',
        clinicName: 'أحمد منصور',
        package: 'Package-1',
        managerName: 'info@gmail.com',
        email: 'info@gmail.com',
        loginDate: '01/03/2025',
        failedLogins: 231,
        users: 21,
        storage: '50جيجا/100جيجا',
    },
    {
        id: 'Sub-17',
        clinicName: 'أحمد منصور',
        package: 'Package-1',
        managerName: 'info@gmail.com',
        email: 'info@gmail.com',
        loginDate: '01/03/2025',
        failedLogins: 231,
        users: 21,
        storage: '50جيجا/100جيجا',
    },
    {
        id: 'Sub-18',
        clinicName: 'أحمد منصور',
        package: 'Package-1',
        managerName: 'info@gmail.com',
        email: 'info@gmail.com',
        loginDate: '01/03/2025',
        failedLogins: 231,
        users: 21,
        storage: '50جيجا/100جيجا',
    },
    {
        id: 'Sub-19',
        clinicName: 'أحمد منصور',
        package: 'Package-1',
        managerName: 'info@gmail.com',
        email: 'info@gmail.com',
        loginDate: '01/03/2025',
        failedLogins: 231,
        users: 21,
        storage: '50جيجا/100جيجا',
    },
];

// ========== Page Component ==========
export default function AuditLogsPage() {
    const params = useParams();
    const locale = params.locale as Locale;
    const t = (key: string) => getTranslation(locale, `auditLogs.${key}`);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 3;

    // State for drawer
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    // Sorting state
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const handleSort = () => {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        // TODO: Implement actual sorting logic here
        console.log('Sorting toggled:', sortDirection === 'asc' ? 'desc' : 'asc');
    };

    // Table columns
    const columns: TableColumn<AuditLog>[] = [
        { key: 'id', header: 'ID' },
        { key: 'clinicName', header: t('columns.clinicName') },
        { key: 'package', header: 'Package' },
        { key: 'managerName', header: t('columns.managerName') },
        { key: 'loginDate', header: t('columns.loginDate') },
        { key: 'failedLogins', header: t('columns.failedLogins') },
        { key: 'users', header: t('columns.users') },
        { key: 'storage', header: t('columns.storage') },
    ];

    return (
        <div className="space-y-6">


            {/* Table */}
            <Table
                data={mockAuditLogs}
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
                rowActions={(log) => (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                setSelectedLog(log);
                                setIsDrawerOpen(true);
                            }}
                            className="p-2 hover:bg-grey-100 rounded-lg transition-colors"
                            title={t('actions.view')}
                        >
                            <Image
                                src="/shered/table/eye.svg"
                                alt="View"
                                width={20}
                                height={20}
                            />
                        </button>
                        <button
                            onClick={() => {
                                console.log('Delete log:', log.id);
                            }}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title={t('actions.delete')}
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
                actionsHeader={t('columns.actions')}
            />

            {/* Audit Log Details Drawer */}
            <Drawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title="سجل أنشطة العيادة"
                size="md"
            >
                {selectedLog && (
                    <AuditLogDetails log={selectedLog} />
                )}
            </Drawer>
        </div>
    );
}
