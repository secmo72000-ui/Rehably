import React from 'react';
import { TableColumn } from '@/ui/components';
import { Clinic, ClinicStatus } from '@/domains/clinics/clinics.types';
import TableRowActions from '@/ui/components/TableRowActions';
import PaymentStatusBadge from '@/ui/components/PaymentStatusBadge';
import { formatDate } from '@/shared/utils';
import { getRegistrationStatusKey, getPaymentStatus } from '@/domains/clinics/clinics.utils';

interface GetTableColumnsProps {
    t: (key: string) => string;
    onView: (clinic: Clinic) => void;
    onEdit: (clinic: Clinic) => void;
    onDelete: (clinic: Clinic) => void;
}

/**
 * Generate clinic table columns configuration
 * Columns: اسم العيادة → Package → اسم المدير → البريد الالكتروني → تاريخ الانشاء → المنطقة → حالة الدفع → طلب التسجيل → التفاصيل
 */
export const getClinicsTableColumns = ({
    t,
    onView,
    onEdit,
    onDelete,
}: GetTableColumnsProps): TableColumn<Clinic>[] => [

        {
            key: 'name',
            header: t('columns.name'),
            render: (value) => (
                <span
                    title={value as string}
                    style={{
                        display: 'inline-block',
                        maxWidth: '140px',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'wrap',
                    }}
                >
                    {value as string}
                </span>
            ),
        },

        // 2. Package (الباكدج)
        {
            key: 'subscriptionPlanName',
            header: t('columns.package'),
            render: (value) => value || t('details.noPlan'),
        },

        // 3. اسم المدير
        {
            key: 'ownerFirstName',
            header: t('columns.managerName'),
            render: (_, row) => `${row.ownerFirstName} ${row.ownerLastName}`,
        },

        // 4. البريد الالكتروني
        {
            key: 'ownerEmail',
            header: t('columns.email'),
            render: (value) => (
                <span
                    title={value as string}
                    style={{
                        display: 'inline-block',
                        maxWidth: '140px',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'wrap',

                    }}
                >
                    {value as string}
                </span>
            ),
        },

        // 5. تاريخ الانشاء
        {
            key: 'createdAt',
            header: t('columns.createdAt'),
            render: (value) => formatDate(value as string),
        },

        // 6. المنطقة
        {
            key: 'city',
            header: t('columns.region'),
            render: (_, row) => {
                const parts = [row.city, row.country].filter(Boolean);
                return (
                    <span
                        title={parts.length > 0 ? parts.join(' - ') : t('details.notSpecified')}
                        style={{
                            display: 'inline-block',
                            maxWidth: '140px',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'wrap',
                        }}
                    >
                        {parts.length > 0 ? parts.join(' - ') : t('details.notSpecified')}
                    </span>
                );
            },
        },
        {
            key: 'subscriptionPlanId',
            header: t('columns.paymentStatus'),
            render: (_, row) => {
                const paymentStatus = getPaymentStatus(row.subscriptionStatus);
                return (
                    <PaymentStatusBadge
                        status={paymentStatus}
                        config={{
                            paid: { label: t('payment.paid'), color: 'success' },
                            unpaid: { label: t('payment.unpaid'), color: 'warning' },
                            suspended: { label: t('registrationStatus.suspended'), color: 'error' },
                            refunded: { label: t('payment.unpaid'), color: 'info' },
                        }}
                    />
                );
            },
        },

        // 8. طلب التسجيل
        {
            key: 'status',
            header: t('columns.registrationRequest'),
            render: (_, row) => {
                const statusKey = getRegistrationStatusKey(row.status);
                const colorMap: Record<string, string> = {
                    accepted: 'var(--color-Primary-500)',
                    pending: 'var(--color-warning-400)',
                    rejected: 'var(--color-error-600)',
                    suspended: 'var(--color-warning-400)',
                };
                return (
                    <span
                        style={{
                            color: colorMap[statusKey] || 'var(--color-Primary-500)',
                            fontWeight: 500,
                        }}
                    >
                        {t(`registrationStatus.${statusKey}`)}
                    </span>
                );
            },
        },

        // 9. التفاصيل (Actions)
        {
            key: 'actions',
            header: t('columns.actions'),
            render: (_, row) => (
                <TableRowActions
                    onView={() => onView(row)}
                    onEdit={() => onEdit(row)}
                    onDelete={() => onDelete(row)}
                />
            ),
        },
    ];
