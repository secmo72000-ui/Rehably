import React from 'react';
import { TableColumn } from '@/ui/components';
import { Clinic } from '@/domains/clinics/clinics.types';
import TableRowActions from '@/ui/components/TableRowActions';
import PaymentStatusBadge from '@/ui/components/PaymentStatusBadge';
import { formatDate } from '@/shared/utils';

interface GetTableColumnsProps {
    t: (key: string) => string;
    onView: (clinic: Clinic) => void;
    onDelete: (clinic: Clinic) => void;
}

/**
 * Generate clinic table columns configuration
 */
export const getClinicsTableColumns = ({
    t,
    onView,
    onDelete,
}: GetTableColumnsProps): TableColumn<Clinic>[] => [
        {
            key: 'id',
            header: t('columns.id'),
            render: (value) => `#${value}`,
        },
        { key: 'name', header: t('columns.name') },
        {
            key: 'subscriptionPlanName',
            header: t('columns.package'),
            render: (value) => value || t('details.noPlan'),
        },
        {
            key: 'subscriptionStartDate',
            header: t('columns.subscriptionDate'),
            render: (value) => formatDate(value as string),
        },
        {
            key: 'subscriptionEndDate',
            header: t('columns.expiryDate'),
            render: (value) => formatDate(value as string),
        },
           {
            key: 'usersCount',
            header: t('columns.doctorsCount'),
            align: 'center',
        },
        {
            key: 'subscriptionPlanId',
            header: t('columns.paymentStatus'),
            render: (_, row) => {
                const isPaid = row.subscriptionPlanId !== null;
                return (
                    <PaymentStatusBadge
                        status={isPaid ? 'paid' : 'unpaid'}
                        config={{
                            paid: { label: t('payment.paid'), color: 'success' },
                            unpaid: { label: t('payment.unpaid'), color: 'warning' },
                        }}
                    />
                );
            },
        },
     
        {
            key: 'subscriptionStatus',
            header: t('columns.status'),
            render: (_, row) => {
                const isActive = row.subscriptionStatus === 1;
                return (
                    <PaymentStatusBadge
                        status={isActive ? 'active' : 'suspended'}
                        config={{
                            active: { label: t('status.active'), color: 'success' },
                            suspended: { label: t('status.suspended'), color: 'error' },
                        }}
                    />
                );
            }
        },
        {
            key: 'actions',
            header: t('columns.actions'),
            render: (_, row) => (
                <TableRowActions
                    onView={() => onView(row)}
                    onDelete={() => onDelete(row)}
                />
            ),
        },
    ];
