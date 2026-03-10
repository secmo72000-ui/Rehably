'use client';

import React from 'react';
import { UserProfile } from '@/ui/components';
import { GeneralInput } from '@/ui/primitives';
import { AuditLogDto } from '@/domains/audit';

interface AuditLogDetailsProps {
    log: AuditLogDto;
}

export function AuditLogDetails({ log }: AuditLogDetailsProps) {
    if (!log) return null;

    const dt = new Date(log.timestamp);
    const dateStr = dt.toLocaleDateString();
    const timeStr = dt.toLocaleTimeString();

    return (
        <div className="space-y-6">
            <div className="pb-4 flex justify-start items-center border-b border-gray-100">
                <UserProfile name={log.userEmail || "Unknown User"} email={log.userRole || ""} size="md" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1 text-right">معرف السجل</p>
                    <GeneralInput value={log.id} onChange={() => { }} readOnly />
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1 text-right">تاريخ الحدث</p>
                    <GeneralInput value={`${dateStr} - ${timeStr}`} onChange={() => { }} readOnly />
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1 text-right">نوع الحدث</p>
                    <GeneralInput value={log.actionType} onChange={() => { }} readOnly />
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1 text-right">عنصر التعديل</p>
                    <GeneralInput value={log.entityName} onChange={() => { }} readOnly />
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1 text-right">معرف العنصر</p>
                    <GeneralInput value={log.entityId} onChange={() => { }} readOnly />
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1 text-right">اسم العيادة</p>
                    <GeneralInput value={log.clinicName || '-'} onChange={() => { }} readOnly />
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1 text-right">معرف العيادة</p>
                    <GeneralInput value={log.clinicId || '-'} onChange={() => { }} readOnly />
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1 text-right">الخطة المالية (الاشتراك)</p>
                    <GeneralInput value={log.packageName || '-'} onChange={() => { }} readOnly />
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1 text-right">الحالة</p>
                    <div className="mt-1 flex justify-end">
                        <span className={`px-3 py-1.5 rounded-md font-semibold ${log.isSuccess ? 'bg-success-50 text-success-600' : 'bg-red-50 text-red-600'}`}>
                            {log.isSuccess ? 'نجاح' : 'فشل'}
                        </span>
                    </div>
                </div>
            </div>

            {log.details && (
                <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-500 mb-1 text-right">تفاصيل الحدث</p>
                    <textarea
                        className="w-full h-32 p-3 text-sm text-gray-700 bg-gray-50 rounded-lg border border-gray-200 outline-none"
                        readOnly
                        value={log.details}
                    />
                </div>
            )}
        </div>
    );
}
