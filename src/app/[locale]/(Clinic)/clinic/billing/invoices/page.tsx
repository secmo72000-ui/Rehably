'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { invoiceService } from '@/domains/billing/billing.service';
import type { ClinicInvoiceStatus, InvoiceSummary } from '@/domains/billing/billing.types';

const statusLabels: Record<ClinicInvoiceStatus, string> = {
  Draft: 'مسودة', Issued: 'صادرة', PartiallyPaid: 'مدفوعة جزئياً',
  Paid: 'مدفوعة', Cancelled: 'ملغاة', Refunded: 'مستردة',
};
const statusColors: Record<ClinicInvoiceStatus, string> = {
  Draft: 'bg-gray-100 text-gray-600',
  Issued: 'bg-blue-100 text-blue-700',
  PartiallyPaid: 'bg-yellow-100 text-yellow-700',
  Paid: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
  Refunded: 'bg-purple-100 text-purple-700',
};

export default function InvoicesPage() {
  const params = useParams();
  const locale = params?.locale as string ?? 'ar';

  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { load(); }, [page, debouncedSearch, statusFilter]);

  async function load() {
    setLoading(true);
    try {
      const p: Record<string, string> = { page: String(page), pageSize: '15' };
      if (debouncedSearch) p.search = debouncedSearch;
      if (statusFilter) p.status = statusFilter;
      const res = await invoiceService.getAll(p);
      setInvoices(res.items);
      setTotalPages(res.totalPages);
      setTotalCount(res.totalCount);
    } catch { } finally { setLoading(false); }
  }

  const formatAmount = (n: number, currency = 'EGP') =>
    `${n.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ${currency === 'EGP' ? 'ج.م' : currency}`;

  return (
    <div dir="rtl" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">الفواتير</h1>
          <p className="text-sm text-gray-500 mt-1">{totalCount} فاتورة إجمالاً</p>
        </div>
        <Link href={`/${locale}/clinic/billing/invoices/new`}
          className="px-4 py-2 bg-[#29AAFE] text-white rounded-lg text-sm font-medium hover:bg-[#1a9aee]">
          + فاتورة جديدة
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="بحث برقم الفاتورة أو اسم المريض..."
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:border-[#29AAFE]" />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#29AAFE]">
          <option value="">كل الحالات</option>
          {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#29AAFE] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">🧾</div>
            <p className="text-gray-500 text-sm">لا توجد فواتير</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['رقم الفاتورة', 'المريض', 'الإجمالي', 'المدفوع', 'المتبقي', 'تاريخ الاستحقاق', 'الحالة', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-right text-xs font-semibold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-semibold text-[#29AAFE]">{inv.invoiceNumber}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{inv.patientName || '—'}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{formatAmount(inv.totalDue, inv.currency)}</td>
                    <td className="px-4 py-3 text-green-600">{formatAmount(inv.totalPaid, inv.currency)}</td>
                    <td className={`px-4 py-3 font-semibold ${inv.balance > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                      {formatAmount(inv.balance, inv.currency)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('ar-EG') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[inv.status]}`}>
                        {statusLabels[inv.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/${locale}/clinic/billing/invoices/${inv.id}`}
                        className="text-xs text-[#29AAFE] hover:underline">عرض</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-100">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50">
                  السابق
                </button>
                <span className="text-sm text-gray-500">{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50">
                  التالي
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
