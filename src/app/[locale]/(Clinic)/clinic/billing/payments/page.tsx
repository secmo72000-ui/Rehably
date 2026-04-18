'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { paymentService } from '@/domains/billing/billing.service';
import type { ClinicPayment, PaymentMethod, PaymentStatus, PaymentSummary } from '@/domains/billing/billing.types';

const methodLabels: Record<PaymentMethod, string> = {
  Cash: 'نقدي', Card: 'بطاقة', Online: 'أونلاين', Insurance: 'تأمين', BankTransfer: 'تحويل بنكي',
};
const methodIcons: Record<PaymentMethod, string> = {
  Cash: '💵', Card: '💳', Online: '🌐', Insurance: '🏥', BankTransfer: '🏦',
};
const statusLabels: Record<PaymentStatus, string> = {
  Pending: 'معلق', Processing: 'قيد المعالجة', Completed: 'مكتمل',
  Failed: 'فشل', Refunded: 'مستردة', PartiallyRefunded: 'مستردة جزئياً',
};
const statusColors: Record<PaymentStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-700', Processing: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700', Failed: 'bg-red-100 text-red-700',
  Refunded: 'bg-purple-100 text-purple-700', PartiallyRefunded: 'bg-orange-100 text-orange-700',
};

export default function PaymentsPage() {
  const params = useParams();
  const locale = params?.locale as string ?? 'ar';

  const [payments, setPayments] = useState<ClinicPayment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [methodFilter, setMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => { load(); }, [page, methodFilter, statusFilter]);
  useEffect(() => { loadSummary(); }, []);

  async function load() {
    setLoading(true);
    try {
      const p: Record<string, string> = { page: String(page), pageSize: '15' };
      if (methodFilter) p.method = methodFilter;
      if (statusFilter) p.status = statusFilter;
      const res = await paymentService.getAll(p);
      setPayments(res.items);
      setTotalPages(res.totalPages);
    } catch { } finally { setLoading(false); }
  }

  async function loadSummary() {
    try {
      const s = await paymentService.getSummary();
      setSummary(s);
    } catch { }
  }

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleRefund() {
    if (!refundingId) return;
    try {
      await paymentService.refund(refundingId, { reason: refundReason });
      await load();
      await loadSummary();
      setShowRefundModal(false);
      setRefundReason('');
      showToast('تم استرداد الدفعة', 'success');
    } catch { showToast('حدث خطأ', 'error'); }
  }

  const fmt = (n: number) => n.toLocaleString('ar-EG', { minimumFractionDigits: 2 });

  return (
    <div dir="rtl" className="p-6">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">المدفوعات</h1>
          <p className="text-sm text-gray-500 mt-1">سجل جميع الدفعات والتحصيلات</p>
        </div>
        <Link href={`/${locale}/clinic/billing/invoices`}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          الفواتير
        </Link>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'إجمالي المحصّل', value: fmt(summary.totalCollected), color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'معلق', value: fmt(summary.totalPending), color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'مستردة', value: fmt(summary.totalRefunded), color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'عدد المعاملات', value: summary.totalTransactions.toString(), color: 'text-[#29AAFE]', bg: 'bg-blue-50' },
          ].map(c => (
            <div key={c.label} className={`${c.bg} rounded-xl p-4 border border-gray-100`}>
              <div className="text-xs text-gray-500 mb-1">{c.label}</div>
              <div className={`text-lg font-bold ${c.color}`}>{c.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Method breakdown */}
      {summary && Object.keys(summary.byMethod).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
          <div className="text-sm font-semibold text-gray-700 mb-3">توزيع حسب طريقة الدفع</div>
          <div className="flex flex-wrap gap-3">
            {Object.entries(summary.byMethod).map(([method, amount]) => (
              <div key={method} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                <span>{methodIcons[method as PaymentMethod] ?? '💰'}</span>
                <div>
                  <div className="text-xs text-gray-500">{methodLabels[method as PaymentMethod] ?? method}</div>
                  <div className="text-sm font-semibold text-gray-800">{fmt(amount)} ج.م</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select value={methodFilter} onChange={e => { setMethodFilter(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#29AAFE]">
          <option value="">كل الطرق</option>
          {Object.entries(methodLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
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
        ) : payments.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">💳</div>
            <p className="text-gray-500 text-sm">لا توجد مدفوعات</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['الفاتورة', 'المريض', 'المبلغ', 'الطريقة', 'المرجع', 'التاريخ', 'الحالة', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-right text-xs font-semibold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/${locale}/clinic/billing/invoices/${p.invoiceId}`}
                        className="font-mono text-sm text-[#29AAFE] hover:underline">{p.invoiceNumber}</Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{p.patientName || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{fmt(p.amount)} ج.م</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-gray-600">
                        {methodIcons[p.method]} {methodLabels[p.method]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">{p.transactionReference || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString('ar-EG') : new Date(p.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[p.status]}`}>
                        {statusLabels[p.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.status === 'Completed' && (
                        <button onClick={() => { setRefundingId(p.id); setShowRefundModal(true); }}
                          className="text-xs text-red-500 hover:text-red-700 hover:underline">استرداد</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-100">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1 border border-gray-200 rounded text-sm disabled:opacity-40 hover:bg-gray-50">السابق</button>
                <span className="text-sm text-gray-500">{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1 border border-gray-200 rounded text-sm disabled:opacity-40 hover:bg-gray-50">التالي</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Refund modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
            <div className="px-5 py-4 border-b">
              <h3 className="font-semibold text-gray-800">استرداد الدفعة</h3>
            </div>
            <div className="p-5">
              <label className="text-sm font-medium text-gray-700 block mb-2">سبب الاسترداد (اختياري)</label>
              <textarea value={refundReason} onChange={e => setRefundReason(e.target.value)}
                rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#29AAFE] resize-none" />
            </div>
            <div className="px-5 pb-4 flex gap-2 justify-end">
              <button onClick={() => setShowRefundModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">إلغاء</button>
              <button onClick={handleRefund} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">تأكيد الاسترداد</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
