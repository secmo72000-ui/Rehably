'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';
import { Table, Drawer, type TableColumn } from '@/ui/components';
import { InvoiceDetails, type InvoiceDetailsProps } from './_components';
import Image from 'next/image';

// ========== Types ==========
interface Invoice {
    id: string;
    clinicName: string;
    package: string;
    paymentDate: string;
    dueDate: string;
    paymentMethod: string;
    amountPaid: number;
    status: 'paid' | 'rejected' | 'pending';
    invoiceNumber: string;
    customerEmail: string;
    country: string;
    subscriptionPlan: string;
    renewalType: string;
    billingPeriod: string;
}

// ========== Mock Data ==========
const mockInvoices: Invoice[] = [
    {
        id: 'Sub-10',
        clinicName: 'احمد منصور',
        package: 'Package-1',
        paymentDate: '01/02/2025',
        dueDate: '01/03/2025',
        paymentMethod: 'بطاقة ماالك',
        amountPaid: 1200,
        status: 'paid',
        invoiceNumber: 'TXN-45892317',
        customerEmail: 'uxeasin@gmail.com',
        country: 'مصر',
        subscriptionPlan: 'Rehably Pro',
        renewalType: 'تجديد الاشتراك',
        billingPeriod: 'Rehably annual',
    },
    {
        id: 'Sub-11',
        clinicName: 'احمد منصور',
        package: 'Package-1',
        paymentDate: '01/02/2025',
        dueDate: '01/03/2025',
        paymentMethod: 'بطاقة ماالك',
        amountPaid: 1200,
        status: 'paid',
        invoiceNumber: 'TXN-45892318',
        customerEmail: 'uxeasin@gmail.com',
        country: 'مصر',
        subscriptionPlan: 'Rehably Pro',
        renewalType: 'تجديد الاشتراك',
        billingPeriod: 'Rehably annual',
    },
    {
        id: 'Sub-12',
        clinicName: 'احمد منصور',
        package: 'Package-1',
        paymentDate: '01/02/2025',
        dueDate: '01/03/2025',
        paymentMethod: 'بطاقة ماالك',
        amountPaid: 1200,
        status: 'rejected',
        invoiceNumber: 'TXN-45892319',
        customerEmail: 'uxeasin@gmail.com',
        country: 'مصر',
        subscriptionPlan: 'Rehably Pro',
        renewalType: 'تجديد الاشتراك',
        billingPeriod: 'Rehably annual',
    },
    {
        id: 'Sub-13',
        clinicName: 'احمد منصور',
        package: 'Package-1',
        paymentDate: '01/02/2025',
        dueDate: '01/03/2025',
        paymentMethod: 'بطاقة ماالك',
        amountPaid: 1200,
        status: 'pending',
        invoiceNumber: 'TXN-45892320',
        customerEmail: 'uxeasin@gmail.com',
        country: 'مصر',
        subscriptionPlan: 'Rehably Pro',
        renewalType: 'تجديد الاشتراك',
        billingPeriod: 'Rehably annual',
    },
];

// ========== Page Component ==========
export default function InvoicesPage() {
    const params = useParams();
    const locale = params.locale as Locale;
    const t = (key: string) => getTranslation(locale, `invoices.${key}`);

    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const handleSort = () => {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        // TODO: Implement actual sorting logic here
        console.log('Sorting toggled:', sortDirection === 'asc' ? 'desc' : 'asc');
    };

    // Status badge configuration
    const statusConfig = {
        paid: { label: 'مدفوع', color: 'bg-confirm-50 text-confirm-600' },
        rejected: { label: 'مرفوض', color: 'bg-error-50 text-error-600' },
        pending: { label: 'غير مدفوع', color: 'bg-warning-50 text-warning-600' },
    };

    // Table columns
    const columns: TableColumn<Invoice>[] = [
        { key: 'id', header: 'ID' },
        { key: 'clinicName', header: 'اسم العيادة' },
        { key: 'package', header: 'Package' },
        { key: 'paymentDate', header: 'تاريخ الدفع' },
        { key: 'dueDate', header: 'معتاد إلى' },
        { key: 'paymentMethod', header: 'طريقة الدفع' },
        {
            key: 'amountPaid',
            header: 'المبلغ المدفوع',
            render: (value, invoice) => `${invoice.amountPaid} جنيها`
        },
        {
            key: 'status',
            header: 'حالة الدفع',
            render: (value, invoice) => {
                const config = statusConfig[invoice.status];
                return (
                    <span className={`px-3 py-1 rounded-full text-sm-medium ${config.color}`}>
                        {config.label}
                    </span>
                );
            },
        },
        {
            key: 'invoiceNumber',
            header: 'طباعة الفاتورة',
            render: (value, invoice) => (
                <button
                    onClick={() => {
                        setSelectedInvoice(invoice);
                        setIsDrawerOpen(true);
                    }}
                    className="text-Primary-500 hover:underline text-sm-medium"
                >
                    طباعة الفاتورة
                </button>
            ),
        },
    ];

    return (
        <div className="space-y-6">

            {/* Table */}
            <Table
                data={mockInvoices}
                columns={columns}
                rowKey="id"
                title="قائمة الفواتير"
                emptyMessage="لا توجد فواتير"
                sorting={{
                    active: true,
                    direction: sortDirection,
                    onToggle: handleSort
                }}
                rowActions={(invoice) => (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                setSelectedInvoice(invoice);
                                setIsDrawerOpen(true);
                            }}
                            className="p-2 hover:bg-grey-100 rounded-lg transition-colors"
                            title="عرض الفاتورة"
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
                                console.log('Delete invoice:', invoice.id);
                            }}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="حذف"
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
                actionsHeader="تفاصيل"
            />

            {/* Invoice Details Drawer */}
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
                        id={selectedInvoice.id}
                        amount={selectedInvoice.amountPaid}
                        status={selectedInvoice.status}
                        issueDate={selectedInvoice.paymentDate}
                        dueDate={selectedInvoice.dueDate}
                        customerName={selectedInvoice.clinicName}
                        customerEmail={selectedInvoice.customerEmail}
                        invoiceNumber={selectedInvoice.invoiceNumber}
                        country={selectedInvoice.country}
                        subscriptionPlan={selectedInvoice.subscriptionPlan}
                        renewalType={selectedInvoice.renewalType}
                        billingPeriod={selectedInvoice.billingPeriod}
                        subtotal={selectedInvoice.amountPaid}
                        total={selectedInvoice.amountPaid}
                        description={`Rehably annual Subscription Renewal 2025-2026`}
                    />
                </Drawer>
            )}
        </div>
    );
}
