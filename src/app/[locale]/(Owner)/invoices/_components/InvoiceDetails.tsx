'use client';

import React from 'react';
import { Button } from '@/ui/primitives';
import { useLocale } from '@/shared/hooks';
import { getTranslation } from '@/shared/i18n';
import { AdminInvoice, getPaymentStatusKey } from '@/domains/invoices';

export interface InvoiceDetailsProps {
    invoice: AdminInvoice;
    onDownloadPdf: () => void;
}

export function InvoiceDetails({ invoice, onDownloadPdf }: InvoiceDetailsProps) {
    const { locale } = useLocale();
    const t = (key: string) => getTranslation(locale, `invoices.${key}`);

    const statusKey = getPaymentStatusKey(invoice.paymentStatus);

    const statusConfig = {
        paid: { label: t('status.paid'), color: 'bg-confirm-50 text-confirm-600' },
        rejected: { label: t('status.rejected'), color: 'bg-error-50 text-error-600' },
        pending: { label: t('status.pending'), color: 'bg-warning-50 text-warning-600' },
    };

    const statusInfo = statusConfig[statusKey];

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString(locale === 'ar' ? 'en-GB' : locale);
        } catch {
            return dateStr;
        }
    };

    const billingPeriod = `${formatDate(invoice.billingPeriodStart)} - ${formatDate(invoice.billingPeriodEnd)}`;

    return (
        <div className="space-y-6">
            {/* Header Row: Title + Price */}
            <div className="flex items-start justify-between pb-4">
                <div className="flex flex-col items-start">
                    <h2 className="text-2xl-bold text-text">{t('invoiceTitle')}</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm-regular text-subtitle">{formatDate(invoice.dueDate)}</span>
                        <span className="text-subtitle">|</span>
                        <span className="text-sm-regular text-subtitle">
                            {invoice.paidAt ? formatDate(invoice.paidAt) : formatDate(invoice.billingPeriodStart)}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <h3 className="text-5xl-bold text-text">{invoice.totalAmount} {invoice.currency}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                    </span>
                </div>
            </div>
            <div className="bg-[#F8F9FA] p-4 space-y-6">

                {/* Customer Information */}
                <div className="rounded-xl">
                    <h4 className="text-lg-bold text-text mb-4 text-start">{t('customerInfo.title')}</h4>
                    <div className="bg-white py-3 px-6 rounded-lg space-y-4">
                        {[
                            { label: t('customerInfo.name'), value: invoice.clinicName },
                            { label: t('customerInfo.email'), value: invoice.clinicEmail },
                            { label: t('customerInfo.invoiceNumber'), value: invoice.invoiceNumber },
                            { label: t('customerInfo.country'), value: invoice.clinicCountry || '-' },
                        ].map((row, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <p className="text-base-bold text-text">{row.label}</p>
                                <p className="text-xl-bold text-text">{row.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Invoice Items */}
                <div className="bg-white rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#EFF1F3]">
                        <h4 className="text-lg-bold text-text">{t('invoiceItems.subscriptionDetails')}</h4>
                        <h4 className="text-lg-bold text-text">{t('invoiceItems.title')}</h4>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <p className="text-base-regular text-subtitle">{t('invoiceItems.subscriptionPlan')}</p>
                            <p className="text-base-regular text-text">{invoice.packageName}</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-base-regular text-subtitle">{t('invoiceItems.renewalType')}</p>
                            <p className="text-base-regular text-text">{invoice.transactionType || '-'}</p>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-lg">
                            <p className="text-base-regular text-subtitle">{t('invoiceItems.subscriptionDetails')}</p>
                            <p className="text-lg-bold text-text">{billingPeriod}</p>
                        </div>
                    </div>
                </div>

                {/* Totals */}
                <div className="space-y-3 bg-grey-50 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <p className="text-base-regular text-text">{invoice.amount} {invoice.currency}</p>
                        <p className="text-base-semibold text-text">{t('totals.subtotal')}</p>
                    </div>
                    {invoice.taxAmount > 0 && (
                        <div className="flex items-center justify-between text-sm-regular">
                            <p className="text-subtitle">{invoice.taxAmount} {invoice.currency} ({invoice.taxRate}%)</p>
                            <p className="text-subtitle">{t('totals.tax') || 'الضريبة'}</p>
                        </div>
                    )}
                    {invoice.addOnsAmount > 0 && (
                        <div className="flex items-center justify-between text-sm-regular">
                            <p className="text-subtitle">{invoice.addOnsAmount} {invoice.currency}</p>
                            <p className="text-subtitle">{t('totals.addOns') || 'الإضافات'}</p>
                        </div>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-grey-200">
                        <p className="text-2xl-bold text-text">{invoice.totalAmount} {t('totals.currency')}</p>
                        <p className="text-lg-bold text-text">{t('totals.total')}</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center space-y-2 pt-4">
                <p className="text-lg-regular text-subtitle">
                    {t('footer.footerText')}{' '}
                    <span className="text-Primary-500">{t('footer.platformName')}</span>
                </p>
                <div className="flex items-center justify-center gap-4 text-sm-regular text-subtitle">
                    <a href="mailto:Support@Rehably.com" className="text-Primary-500">
                        Support@Rehably.com
                    </a>
                    <span>|</span>
                    <a href="https://www.Rehably.com" className="text-Primary-500">
                        www.Rehably.com
                    </a>
                </div>
            </div>

            {/* Download Button */}
            <Button
                onClick={onDownloadPdf}
                variant="primary"
                fullWidth
                className="mt-6"
            >
                {t('downloadPDF')}
            </Button>
        </div>
    );
}
