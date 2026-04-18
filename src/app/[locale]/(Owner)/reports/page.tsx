'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';
import { invoicesService, getPaymentStatusKey } from '@/domains/invoices';
import { clinicsService, ClinicStatus } from '@/domains/clinics';
import type { AdminInvoice } from '@/domains/invoices';

// ============================================================
// Types
// ============================================================

interface ReportStats {
  totalRevenue: number;
  totalClinics: number;
  activeClinics: number;
  suspendedClinics: number;
  paidInvoices: number;
  pendingInvoices: number;
  rejectedInvoices: number;
  monthlySubscriptions: number;
  yearlySubscriptions: number;
  recentInvoices: AdminInvoice[];
  monthlyRevenue: { month: string; value: number }[];
}

type FilterPeriod = 'month' | 'year' | 'all';

const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ============================================================
// Sub-components
// ============================================================

interface StatCardProps {
  title: string;
  value: string | number;
  sub?: string;
  subValue?: string | number;
  color?: string;
  icon?: React.ReactNode;
}

function StatCard({ title, value, sub, subValue, color = 'bg-white', icon }: StatCardProps) {
  return (
    <div className={`${color} rounded-2xl p-6 shadow-sm flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#667085]">{title}</span>
        {icon && <span className="text-[#FF884D]">{icon}</span>}
      </div>
      <span className="text-3xl font-bold text-[#101828]">{value}</span>
      {sub && (
        <span className="text-xs text-[#98A2B3]">
          {sub}: <span className="text-[#344054] font-medium">{subValue}</span>
        </span>
      )}
    </div>
  );
}

interface DonutSegmentProps {
  paid: number;
  pending: number;
  rejected: number;
  labels: { paid: string; pending: string; rejected: string };
}

function InvoiceDonut({ paid, pending, rejected, labels }: DonutSegmentProps) {
  const total = paid + pending + rejected || 1;
  const paidPct = (paid / total) * 100;
  const pendingPct = (pending / total) * 100;
  const rejectedPct = (rejected / total) * 100;

  // Build conic-gradient
  const conicGradient = `conic-gradient(
    #12B76A ${paidPct}%,
    #F79009 ${paidPct}% ${paidPct + pendingPct}%,
    #F04438 ${paidPct + pendingPct}% 100%
  )`;

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className="w-40 h-40 rounded-full relative"
        style={{ background: conicGradient }}
      >
        <div className="absolute inset-6 bg-white rounded-full flex items-center justify-center">
          <span className="text-lg font-bold text-[#101828]">{total}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#12B76A]" />
            <span className="text-sm text-[#475467]">{labels.paid}</span>
          </div>
          <span className="text-sm font-medium text-[#101828]">{paid}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#F79009]" />
            <span className="text-sm text-[#475467]">{labels.pending}</span>
          </div>
          <span className="text-sm font-medium text-[#101828]">{pending}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#F04438]" />
            <span className="text-sm text-[#475467]">{labels.rejected}</span>
          </div>
          <span className="text-sm font-medium text-[#101828]">{rejected}</span>
        </div>
      </div>
    </div>
  );
}

interface RevenueBarChartProps {
  data: { month: string; value: number }[];
  title: string;
  locale: string;
}

function RevenueBarChart({ data, title, locale }: RevenueBarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm w-full h-[360px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#FF884D] rounded-sm" />
          <span className="text-sm text-[#475467]">{title}</span>
        </div>
      </div>
      <div className="flex-1 flex gap-4">
        {/* Y-Axis */}
        <div className="flex flex-col justify-between text-xs text-[#98A2B3] pb-6">
          {[100, 75, 50, 25, 0].map(v => (
            <span key={v}>{Math.round((maxValue * v) / 100).toLocaleString()}</span>
          ))}
        </div>
        {/* Bars */}
        <div className="flex-1 flex items-end justify-between border-b border-[#F2F4F7] pb-0 h-full relative">
          {/* Grid lines */}
          <div className="absolute w-full h-full flex flex-col justify-between pointer-events-none">
            {[0,1,2,3,4].map(i => (
              <div key={i} className="border-t border-dashed border-[#F2F4F7] w-full" />
            ))}
          </div>
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-1 h-full justify-end group">
              <div
                className="w-4 md:w-6 bg-[#FF884D] rounded-t-sm transition-all duration-500 group-hover:bg-[#e06b2e] relative"
                style={{ height: `${Math.max((item.value / maxValue) * 78, item.value > 0 ? 4 : 0)}%` }}
              >
                {/* Tooltip on hover */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#101828] text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {item.value.toLocaleString()}
                </div>
              </div>
              <span className="text-[10px] text-[#98A2B3]">{item.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function ReportsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as Locale;
  const t = (key: string) => getTranslation(locale, `reports.${key}`);
  const isRtl = locale === 'ar';

  const [stats, setStats] = useState<ReportStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [filter, setFilter] = useState<FilterPeriod>('month');

  const months = isRtl ? MONTHS_AR : MONTHS_EN;

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch invoices and clinics in parallel
      const [invoiceData, clinicData] = await Promise.all([
        invoicesService.getAll({ page: 1, pageSize: 100 }),
        clinicsService.getAll({ page: 1, pageSize: 200 }),
      ]);

      const allInvoices: AdminInvoice[] = invoiceData?.items ?? [];
      const allClinics = clinicData?.items ?? [];

      // Filter by period
      const now = new Date();
      const filtered = allInvoices.filter(inv => {
        if (filter === 'all') return true;
        const d = new Date(inv.paidAt || inv.dueDate || '');
        if (isNaN(d.getTime())) return false;
        if (filter === 'month') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        if (filter === 'year') return d.getFullYear() === now.getFullYear();
        return true;
      });

      // Aggregate — use API's totalRevenue when filtering by 'all', else compute from filtered items
      const totalRevenue = filter === 'all' && invoiceData?.totalRevenue != null
        ? invoiceData.totalRevenue
        : filtered.filter(i => getPaymentStatusKey(i.paymentStatus) === 'paid').reduce((s, i) => s + (i.totalAmount || 0), 0);
      const paidInvoices = filtered.filter(i => getPaymentStatusKey(i.paymentStatus) === 'paid').length;
      const pendingInvoices = filtered.filter(i => getPaymentStatusKey(i.paymentStatus) === 'pending').length;
      const rejectedInvoices = filtered.filter(i => getPaymentStatusKey(i.paymentStatus) === 'rejected').length;

      const activeClinics = allClinics.filter((c: any) => c.status === ClinicStatus.Active).length;
      const suspendedClinics = allClinics.filter((c: any) => c.status === ClinicStatus.Suspended).length;

      // Monthly revenue (last 12 months from all invoices)
      const monthlyRevenue = months.map((month, idx) => {
        const targetMonth = (now.getMonth() - (11 - idx) + 12) % 12;
        const targetYear = now.getFullYear() - (now.getMonth() < (11 - idx) ? 1 : 0);
        const rev = allInvoices
          .filter(i => {
            const d = new Date(i.paidAt || '');
            return !isNaN(d.getTime()) && d.getMonth() === targetMonth && d.getFullYear() === targetYear
              && (String(i.paymentStatus).toLowerCase() === 'paid' || (i.paymentStatus as unknown as number) === 0);
          })
          .reduce((s, i) => s + (i.totalAmount || 0), 0);
        return { month, value: rev };
      });

      // Recent 5 invoices
      const recentInvoices = [...filtered]
        .sort((a, b) => new Date(b.paidAt || b.dueDate || '').getTime() - new Date(a.paidAt || a.dueDate || '').getTime())
        .slice(0, 5);

      setStats({
        totalRevenue,
        totalClinics: allClinics.length,
        activeClinics,
        suspendedClinics,
        paidInvoices,
        pendingInvoices,
        rejectedInvoices,
        monthlySubscriptions: 0,
        yearlySubscriptions: 0,
        recentInvoices,
        monthlyRevenue,
      });
    } catch (e) {
      console.error('Reports load error:', e);
      setError(t('error'));
    } finally {
      setIsLoading(false);
    }
  }, [filter, locale]);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Build a simple CSV from recent invoices
      const rows = [
        ['Invoice #', 'Clinic', 'Package', 'Amount', 'Status', 'Date'].join(','),
        ...(stats?.recentInvoices ?? []).map(inv =>
          [inv.invoiceNumber, `"${inv.clinicName}"`, `"${inv.packageName}"`, inv.totalAmount, inv.paymentStatus, inv.paidAt || inv.dueDate].join(',')
        ),
      ];
      const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rehably-report-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try { return new Date(dateStr).toLocaleDateString(isRtl ? 'ar-EG' : 'en-GB'); } catch { return dateStr; }
  };

  const getStatusLabel = (status: string) => {
    const key = getPaymentStatusKey(status);
    if (key === 'paid') return { label: t('recentInvoices.paid'), color: 'bg-green-50 text-green-600' };
    if (key === 'pending') return { label: t('recentInvoices.pending'), color: 'bg-yellow-50 text-yellow-600' };
    return { label: t('recentInvoices.rejected'), color: 'bg-red-50 text-red-600' };
  };

  // ---- Render ----
  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#101828]">{t('pageTitle')}</h1>
        <div className="flex items-center gap-3">
          {/* Period filter */}
          <div className="flex items-center gap-1 bg-white border border-[#D0D5DD] rounded-lg p-1">
            {(['month', 'year', 'all'] as FilterPeriod[]).map(p => (
              <button
                key={p}
                onClick={() => setFilter(p)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  filter === p ? 'bg-[#FF884D] text-white shadow-sm' : 'text-[#667085] hover:bg-[#F9FAFB]'
                }`}
              >
                {t(`filter${p === 'month' ? 'ThisMonth' : p === 'year' ? 'ThisYear' : 'All'}`)}
              </button>
            ))}
          </div>
          {/* Export button */}
          <button
            onClick={handleExport}
            disabled={isExporting || isLoading}
            className="flex items-center gap-2 bg-[#FF884D] hover:bg-[#e06b2e] disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            {isExporting ? t('exporting') : t('exportBtn')}
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm">{error}</div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      {!isLoading && stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title={t('revenue.title')}
              value={`${stats.totalRevenue.toLocaleString()} ${t('revenue.currency')}`}
              sub={t('revenue.subtitle')}
            />
            <StatCard
              title={t('clinics.title')}
              value={stats.totalClinics}
              sub={t('clinics.active')}
              subValue={stats.activeClinics}
            />
            <StatCard
              title={t('invoices.paid')}
              value={stats.paidInvoices}
              color="bg-white"
            />
            <StatCard
              title={t('invoices.pending')}
              value={stats.pendingInvoices}
              sub={t('invoices.rejected')}
              subValue={stats.rejectedInvoices}
              color="bg-white"
            />
          </div>

          {/* Charts row */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Revenue bar chart */}
            <div className="w-full lg:w-[65%]">
              <RevenueBarChart
                data={stats.monthlyRevenue}
                title={t('revenueChart.title')}
                locale={locale}
              />
            </div>
            {/* Invoice donut */}
            <div className="w-full lg:w-[35%] bg-white rounded-2xl p-6 shadow-sm flex flex-col">
              <span className="text-sm text-[#475467] mb-6">{t('invoices.title')}</span>
              <div className="flex-1 flex items-center justify-center">
                <InvoiceDonut
                  paid={stats.paidInvoices}
                  pending={stats.pendingInvoices}
                  rejected={stats.rejectedInvoices}
                  labels={{
                    paid: t('recentInvoices.paid'),
                    pending: t('recentInvoices.pending'),
                    rejected: t('recentInvoices.rejected'),
                  }}
                />
              </div>
            </div>
          </div>

          {/* Recent invoices table */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F2F4F7]">
              <h3 className="text-lg font-semibold text-[#101828]">{t('recentInvoices.title')}</h3>
              <button
                onClick={() => router.push(`/${locale}/invoices`)}
                className="text-[#FF884D] text-sm font-medium underline hover:text-[#e06b2e] transition-colors"
              >
                {t('recentInvoices.viewAll')}
              </button>
            </div>
            <div className="overflow-x-auto">
              {stats.recentInvoices.length === 0 ? (
                <div className="text-center py-12 text-[#98A2B3] text-sm">{t('noData')}</div>
              ) : (
                <table className="w-full text-sm" dir={isRtl ? 'rtl' : 'ltr'}>
                  <thead className="bg-[#F9FAFB]">
                    <tr>
                      {['ID', t('recentInvoices.clinic'), t('recentInvoices.amount'), t('recentInvoices.date'), t('recentInvoices.status')].map(h => (
                        <th key={h} className="px-6 py-3 text-xs font-medium text-[#667085] text-start">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2F4F7]">
                    {stats.recentInvoices.map(inv => {
                      const statusInfo = getStatusLabel(inv.paymentStatus);
                      return (
                        <tr key={inv.id} className="hover:bg-[#F9FAFB] transition-colors">
                          <td className="px-6 py-4 text-[#344054] font-medium">{inv.invoiceNumber}</td>
                          <td className="px-6 py-4 text-[#475467]">{inv.clinicName}</td>
                          <td className="px-6 py-4 text-[#344054] font-medium">
                            {inv.totalAmount?.toLocaleString()} {inv.currency}
                          </td>
                          <td className="px-6 py-4 text-[#475467]">{formatDate(inv.paidAt || inv.dueDate)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
