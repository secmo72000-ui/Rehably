'use client';

import React from 'react';
import { UserProfile, Table, type TableColumn } from '@/ui/components';
import { GeneralInput } from '@/ui/primitives';
import { InfoCard } from '../../clinic-management/components';
import Image from 'next/image';

interface Log {
    id: string;
    logId: string;
    type: string;
    time: string;
    event: string;
    status?: 'success' | 'failed' | 'warning';
    details?: string; // For failed reason
}

interface AuditLogDetailsProps {
    log: any; // We'll use the passed log data which has clinic info
}

// Mock Data for inner tables
const dailyLogs: Log[] = [
    { id: '1', logId: 'Log-10', type: 'فشل التسجيل', time: '12:00 ص', event: 'الحجز', status: 'success' },
    { id: '2', logId: 'Log-10', type: 'فشل التسجيل', time: '12:00 ص', event: 'الحجز', status: 'failed' },
    { id: '3', logId: 'Log-10', type: 'فشل التسجيل', time: '12:00 ص', event: 'الحجز', status: 'success' },
    { id: '4', logId: 'Log-10', type: 'فشل التسجيل', time: '12:00 ص', event: 'الحجز', status: 'success' },
];

const failedLogs: Log[] = [
    { id: '1', logId: 'Log-10', type: 'فشل التسجيل', time: '12:00 ص', event: 'الحجز', details: 'فقد تعرف الخدمة' },
    { id: '2', logId: 'Log-10', type: 'فشل التسجيل', time: '12:00 ص', event: 'الحجز', details: 'فقد تعرف الخدمة' },
    { id: '3', logId: 'Log-10', type: 'فشل التسجيل', time: '12:00 ص', event: 'الحجز', details: 'فقد تعرف الخدمة' },
    { id: '4', logId: 'Log-10', type: 'فشل التسجيل', time: '12:00 ص', event: 'الحجز', details: 'فقد تعرف الخدمة' },
];

export function AuditLogDetails({ log }: AuditLogDetailsProps) {
    if (!log) return null;

    // Reuse clinic details logic
    const storagePercentage = 50; // Mock or calculate
    const storageUsed = 50;
    const storageTotal = 100;

    const infoCards = [
        {
            iconSrc: "/shered/users.svg",
            label: `${log.users || 50} مستخدم`,
            iconAlt: "Users",
        },
        {
            iconSrc: "/shered/Package.svg",
            label: log.package || "Package-1",
            iconAlt: "Package",
        },
        {
            iconSrc: "/shered/location.svg",
            label: "القاهرة",
            iconAlt: "Location",
        },
        {
            iconSrc: "/shered/phone.svg",
            label: "01000000000",
            iconAlt: "Phone",
        },
    ];

    // Status Badge Component
    const StatusBadge = ({ status }: { status?: string }) => {
        if (status === 'success') {
            return <span className="px-3 py-1 rounded bg-[#E6F6EC] text-[#039855] text-sm font-medium">ناجح</span>;
        }
        if (status === 'failed') {
            return <span className="px-3 py-1 rounded bg-[#FEEBED] text-[#D92D20] text-sm font-medium">فشل</span>;
        }
        return null;
    };

    const dailyColumns: TableColumn<Log>[] = [
        { key: 'logId', header: 'LogId' },
        { key: 'type', header: 'النوع' },
        { key: 'time', header: 'التوقيت' },
        { key: 'event', header: 'الحدث' },
        {
            key: 'status', header: 'الحالة', render: (val) => <StatusBadge status={val as string} />
        },
        {
            key: 'actions', header: 'تفاصيل', render: () => (
                <button className="p-1 hover:bg-gray-100 rounded">
                    <Image src="/shered/trash.svg" alt="delete" width={18} height={18} />
                </button>
            )
        }
    ];

    const failedColumns: TableColumn<Log>[] = [
        { key: 'logId', header: 'LogId' },
        { key: 'type', header: 'النوع' },
        { key: 'time', header: 'التوقيت' },
        { key: 'details', header: 'الفشل', render: (val) => <span className="underline decoration-1 underline-offset-4">{val as string}</span> },
        { key: 'event', header: 'الحدث' },
        {
            key: 'actions', header: 'تفاصيل', render: () => (
                <button className="p-1 hover:bg-gray-100 rounded">
                    <Image src="/shered/trash.svg" alt="delete" width={18} height={18} />
                </button>
            )
        }
    ];

    return (
        <div className="space-y-8">
            {/* Header Info Section (Copied from ClinicDetails) */}
            <div className="space-y-6">
                <div className="pb-4 flex justify-start items-center ">
                    <UserProfile name={log.clinicName || "Clinic Group"} email={log.email || ""} size="md" />
                </div>

                <div className="space-y-4">
                    {log.managerName && (
                        <div>
                            <p className="text-sm text-gray-500 mb-1 text-right">مدير العيادة</p>
                            <GeneralInput value={log.managerName} onChange={() => { }} readOnly />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        {infoCards.map((card, index) => (
                            <InfoCard key={index} {...card} />
                        ))}
                    </div>
                </div>

                {/* Storage Progress */}
                <div className="rounded-lg p-5 bg-[#C9F9F2]">
                    <div className="flex items-center justify-between mb-3 gap-2">
                        <div>
                            <h3 className="text-2xl font-bold text-text mb-1 text-right">
                                {storagePercentage}% ممتلئ
                            </h3>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                <span className="direction-ltr">
                                    {storageUsed}GB of {storageTotal}GB used
                                </span>
                                <Image src="/shered/cloud.svg" alt="cloud" width={20} height={20} />
                            </div>
                        </div>

                        {/* Circular Progress */}
                        <div className="relative w-16 h-16 flex-shrink-0">
                            <svg className="w-16 h-16 transform -rotate-90">
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    stroke="white"
                                    strokeWidth="6"
                                    fill="none"
                                />
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    stroke="#06b6d4"
                                    strokeWidth="6"
                                    fill="none"
                                    strokeDasharray={`${storagePercentage * 1.76} 176`}
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Logs Table */}
            <div className="space-y-3">
                <h3 className="text-xl font-bold text-text text-right">الدخول يوميا</h3>
                <div className=" overflow-hidden">
                    <Table
                        data={dailyLogs}
                        columns={dailyColumns}
                        rowKey="id"
                        // Disable standard table features for this nested view
                        pagination={{ currentPage: 1, totalPages: 1, onPageChange: () => { } }}
                    />
                </div>
            </div>

            {/* Failed Logs Table */}
            <div className="space-y-3">
                <h3 className="text-xl font-bold text-text text-right">فشل التسجيل</h3>
                <div className="overflow-hidden">
                    <Table
                        data={failedLogs}
                        columns={failedColumns}
                        rowKey="id"
                        pagination={{ currentPage: 1, totalPages: 1, onPageChange: () => { } }}
                    />
                </div>
            </div>
        </div>
    );
}
