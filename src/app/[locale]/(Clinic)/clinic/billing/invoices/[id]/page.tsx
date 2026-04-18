'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { invoiceService, paymentService } from '@/domains/billing/billing.service';
import type { ClinicInvoice, ClinicInvoiceStatus, PaymentMethod } from '@/domains/billing/billing.types';

const statusLabels: Record<ClinicInvoiceStatus, string> = {
  Draft: 'مسودة', Issued: 'صادرة', PartiallyPaid: 'مدفوعة جزئياً',
  Paid: 'مدفوعة', Cancelled: 'ملغاة', Refunded: 'مستردة',
};
const statusColors: Record<ClinicInvoiceStatus, string> = {
  Draft: 'bg-gray-100 text-gray-600', Issued: 'bg-blue-100 text-blue-700',
  PartiallyPaid: 'bg-yellow-100 text-yellow-700', Paid: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700', Refunded: 'bg-purple-100 text-purple-700',
};
const methodLabels: Record<PaymentMethod, string> = {
  Cash: 'نقدي', Card: 'بطاقة', Online: 'أونلاين', Insurance: 'تأمين', BankTransfer: 'تحويل بنكي',
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale as string ?? 'ar';
  const id = params?.id as string;

  const [invoice, setInvoice] = useState<ClinicInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payForm, setPayForm] = useState({ amount: '', method: 'Cash' as PaymentMethod, notes: '', transactionReference: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => { load(); }, [id]);

  async function load() {
    try {
      const data = await invoiceService.getById(id);
      setInvoice(data);
      setPayForm(f => ({ ...f, amount: String(data.balance) }));
    } catch { } finally { setLoading(false); }
  }

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleRecordPayment() {
    setSaving(true);
    try {
      await paymentService.record({
        invoiceId: id,
        amount: Number(payForm.amount),
        method: payForm.method,
        notes: payForm.notes || undefined,
        transactionReference: payForm.transactionReference || undefined,
      });
      await load();
      setShowPayModal(false);
      showToast('تم تسجيل الدفعة بنجاح', 'success');
    } catch { showToast('حدث خطأ أثناء تسجيل الدفعة', 'error'); } finally { setSaving(false); }
  }

  async function handleCancel() {
    if (!confirm('هل تريد إلغاء هذه الفاتورة؟')) return;
    try {
      await invoiceService.cancel(id);
      await load();
      showToast('تم إلغاء الفاتورة', 'success');
    } catch { showToast('حدث خطأ', 'error'); }
  }

  const fmt = (n: number) => n.toLocaleString('ar-EG', { minimumFractionDigits: 2 });
  const canPay = invoice && invoice.status !== 'Paid' && invoice.status !== 'Cancelled' && invoice.status !== 'Refunded';

  if (loading) return (
    <div dir="rtl" className="p-6 flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-[#29AAFE] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!invoice) return (
    <div dir="rtl" className="p-6 text-center">
      <p className="text-gray-500">لم يتم العثور على الفاتورة</p>
      <Link href={`/${locale}/clinic/billing/invoices`} className="text-[#29AAFE] text-sm mt-2 inline-block">العودة للقائمة</Link>
    </div>
  );

  return (
    <div dir="rtl" className="p-6 max-w-4xl mx-auto">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href={`/${locale}/clinic/billing/invoices`} className="text-sm text-gray-400 hover:text-[#29AAFE] flex items-center gap-1 mb-1">
            ← العودة للفواتير
          </Link>
          <h1 className="text-xl font-bold text-gray-800 font-mono">{invoice.invoiceNumber}</h1>
          <p className="text-sm text-gray-500 mt-1">
            صدرت: {invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleDateString('ar-EG') : '—'}
            {invoice.dueDate && ` · استحقاق: ${new Date(invoice.dueDate).toLocaleDateString('ar-EG')}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusColors[invoice.status]}`}>
            {statusLabels[invoice.status]}
          </span>
          {canPay && (
            <button onClick={() => setShowPayModal(true)}
              className="px-4 py-2 bg-[#29AAFE] text-white rounded-lg text-sm font-medium hover:bg-[#1a9aee]">
              تسجيل دفعة
            </button>
          )}
          {invoice.status === 'Issued' && (
            <button onClick={handleCancel}
              className="px-3 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50">
              إلغاء
            </button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'الإجمالي قبل الخصم', value: fmt(invoice.subTotal), color: 'text-gray-800' },
          { label: 'تغطية التأمين', value: fmt(invoice.insuranceCoverageAmount), color: 'text-blue-600' },
          { label: 'الخصومات', value: fmt(invoice.discountAmount), color: 'text-purple-600' },
          { label: 'المستحق', value: fmt(invoice.totalDue), color: 'text-[#29AAFE] text-lg font-bold' },
        ].map(c => (
          <div key={c.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">{c.label}</div>
            <div className={`font-semibold ${c.color}`}>{c.value} {invoice.currency === 'EGP' ? 'ج.م' : invoice.currency}</div>
          </div>
        ))}
      </div>

      {/* Balance bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">المدفوع: <span className="text-green-600">{fmt(invoice.totalPaid)} ج.م</span></span>
          <span className="text-sm font-medium text-gray-700">المتبقي: <span className={invoice.balance > 0 ? 'text-red-600' : 'text-green-600'}>{fmt(invoice.balance)} ج.م</span></span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#29AAFE] rounded-full transition-all"
            style={{ width: `${Math.min(100, (invoice.totalPaid / invoice.totalDue) * 100)}%` }} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Line items */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <span className="text-sm font-semibold text-gray-700">بنود الفاتورة</span>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b border-gray-50">
              <tr>
                {['الخدمة', 'الكمية', 'السعر', 'الإجمالي'].map(h => (
                  <th key={h} className="px-3 py-2 text-right text-xs text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoice.lineItems.map(li => (
                <tr key={li.id}>
                  <td className="px-3 py-2 text-gray-700">
                    <div>{li.descriptionArabic || li.description}</div>
                    {li.insuranceCoverageAmount > 0 && <div className="text-xs text-blue-500">تأمين: -{fmt(li.insuranceCoverageAmount)}</div>}
                    {li.discountAmount > 0 && <div className="text-xs text-purple-500">خصم: -{fmt(li.discountAmount)}</div>}
                  </td>
                  <td className="px-3 py-2 text-gray-500 text-center">{li.quantity}</td>
                  <td className="px-3 py-2 text-gray-500">{fmt(li.unitPrice)}</td>
                  <td className="px-3 py-2 font-semibold text-gray-800">{fmt(li.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Installments (if any) */}
        {invoice.installmentPlan && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <span className="text-sm font-semibold text-gray-700">خطة التقسيط ({invoice.installmentPlan.numberOfInstallments} أقساط)</span>
            </div>
            <div className="divide-y divide-gray-50">
              {invoice.installmentPlan.schedule.map((s, i) => (
                <div key={s.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-700">القسط {i + 1}</div>
                    <div className="text-xs text-gray-400">{new Date(s.dueDate).toLocaleDateString('ar-EG')}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">{fmt(s.amount)} ج.م</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === 'Paid' ? 'bg-green-100 text-green-700' : s.status === 'Overdue' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                      {s.status === 'Paid' ? 'مدفوع' : s.status === 'Overdue' ? 'متأخر' : 'معلق'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Payment modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">تسجيل دفعة</h3>
              <button onClick={() => setShowPayModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">المبلغ *</label>
                <input type="number" min={0} step="0.01" value={payForm.amount}
                  onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#29AAFE]" />
                <p className="text-xs text-gray-400 mt-1">المتبقي: {fmt(invoice.balance)} ج.م</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">طريقة الدفع</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(methodLabels) as PaymentMethod[]).map(m => (
                    <button key={m} onClick={() => setPayForm(f => ({ ...f, method: m }))}
                      className={`py-2 text-xs rounded-lg border transition-colors ${payForm.method === m ? 'border-[#29AAFE] bg-blue-50 text-[#29AAFE] font-medium' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      {methodLabels[m]}
                    </button>
                  ))}
                </div>
              </div>
              {(payForm.method === 'Card' || payForm.method === 'Online' || payForm.method === 'BankTransfer') && (
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">رقم المرجع</label>
                  <input value={payForm.transactionReference} onChange={e => setPayForm(f => ({ ...f, transactionReference: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#29AAFE]" />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">ملاحظات</label>
                <input value={payForm.notes} onChange={e => setPayForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#29AAFE]" />
              </div>
            </div>
            <div className="px-5 pb-4 flex gap-2 justify-end">
              <button onClick={() => setShowPayModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">إلغاء</button>
              <button onClick={handleRecordPayment} disabled={saving || !payForm.amount}
                className="px-4 py-2 bg-[#29AAFE] text-white rounded-lg text-sm font-medium hover:bg-[#1a9aee] disabled:opacity-50">
                {saving ? 'جاري التسجيل...' : 'تأكيد الدفع'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
