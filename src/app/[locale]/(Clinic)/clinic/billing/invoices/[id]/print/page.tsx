'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { invoiceService } from '@/domains/billing/billing.service';
import { apiClient } from '@/services/api-client';
import type { ClinicInvoice } from '@/domains/billing/billing.types';

interface ClinicProfile {
  clinicName?: string;
  nameArabic?: string;
  logoUrl?: string;
  address?: string;
  city?: string;
  region?: string;
  phone?: string;
  email?: string;
  website?: string;
  specialty?: string;
}

const STATUS_AR: Record<string, string> = {
  Draft: 'مسودة', Issued: 'صادرة', PartiallyPaid: 'مدفوعة جزئياً',
  Paid: 'مدفوعة', Cancelled: 'ملغاة', Refunded: 'مستردة',
};

const fmt = (n: number, currency = 'EGP') =>
  `${n.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ${currency === 'EGP' ? 'ج.م' : currency}`;

const fmtDate = (s?: string) =>
  s ? new Date(s).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

export default function InvoicePrintPage() {
  const params = useParams();
  const locale = params?.locale as string ?? 'ar';
  const id = params?.id as string;

  const [invoice, setInvoice] = useState<ClinicInvoice | null>(null);
  const [clinic, setClinic] = useState<ClinicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      invoiceService.getById(id),
      apiClient.get<{ success: boolean; data: ClinicProfile }>('/api/clinic/profile')
        .then(r => r.data?.data ?? r.data)
        .catch(() => null),
    ]).then(([inv, prof]) => {
      setInvoice(inv);
      setClinic(prof);
    }).finally(() => setLoading(false));
  }, [id]);

  // Auto-print once data loaded
  useEffect(() => {
    if (!loading && invoice) {
      // Small delay so styles render first
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [loading, invoice]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-10 h-10 border-4 border-[#29AAFE] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!invoice) return (
    <div className="flex items-center justify-center h-screen text-gray-500">
      لم يتم العثور على الفاتورة
    </div>
  );

  const isPaid = invoice.status === 'Paid';

  return (
    <>
      {/* Print-only styles injected via style tag */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; }
          .print-page { box-shadow: none !important; margin: 0 !important; }
        }
        @page {
          size: A4;
          margin: 15mm 20mm;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
          background: #f3f4f6;
        }
      `}</style>

      {/* Toolbar — hidden on print */}
      <div className="no-print fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
        >
          ← رجوع
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2 bg-[#29AAFE] text-white rounded-lg text-sm font-medium hover:bg-[#1a9aee] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            طباعة / حفظ PDF
          </button>
        </div>
      </div>

      {/* Invoice A4 sheet */}
      <div className="no-print pt-16" />
      <div
        dir="rtl"
        className="print-page bg-white mx-auto shadow-lg"
        style={{ width: '210mm', minHeight: '297mm', padding: '20mm 20mm 15mm' }}
      >

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-gray-800">
          {/* Clinic info */}
          <div className="flex items-start gap-4">
            {clinic?.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={clinic.logoUrl} alt="logo" className="w-16 h-16 object-contain rounded-lg" />
            )}
            <div>
              <h1 className="text-2xl font-black text-gray-900">
                {clinic?.nameArabic || clinic?.clinicName || 'العيادة'}
              </h1>
              {clinic?.specialty && (
                <p className="text-sm text-gray-500 mt-0.5">{clinic.specialty}</p>
              )}
              {clinic?.address && (
                <p className="text-xs text-gray-500 mt-1">
                  {clinic.address}{clinic.city ? ` — ${clinic.city}` : ''}{clinic.region ? `, ${clinic.region}` : ''}
                </p>
              )}
              <div className="flex gap-4 mt-1">
                {clinic?.phone && <p className="text-xs text-gray-500">📞 {clinic.phone}</p>}
                {clinic?.email && <p className="text-xs text-gray-500">✉ {clinic.email}</p>}
              </div>
            </div>
          </div>

          {/* Invoice badge */}
          <div className="text-left">
            <div className="text-3xl font-black text-[#29AAFE]">فاتورة</div>
            <div className="text-lg font-mono font-bold text-gray-800 mt-1">{invoice.invoiceNumber}</div>
            {/* Paid stamp */}
            {isPaid && (
              <div className="mt-2 inline-block border-2 border-green-500 rounded text-green-600 font-black text-sm px-3 py-1 rotate-[-8deg]">
                مدفوعة ✓
              </div>
            )}
            {invoice.status === 'Cancelled' && (
              <div className="mt-2 inline-block border-2 border-red-400 rounded text-red-500 font-black text-sm px-3 py-1 rotate-[-8deg]">
                ملغاة ✗
              </div>
            )}
          </div>
        </div>

        {/* ── Invoice meta ────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Patient info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">صادرة إلى</div>
            <div className="text-base font-bold text-gray-900">{invoice.patientName}</div>
            <div className="text-xs text-gray-500 mt-0.5">رقم المريض: {invoice.patientId.slice(0, 8).toUpperCase()}</div>
          </div>

          {/* Dates */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">تاريخ الإصدار:</span>
              <span className="font-medium text-gray-800">{fmtDate(invoice.issuedAt || invoice.createdAt)}</span>
            </div>
            {invoice.dueDate && (
              <div className="flex justify-between">
                <span className="text-gray-500">تاريخ الاستحقاق:</span>
                <span className="font-medium text-gray-800">{fmtDate(invoice.dueDate)}</span>
              </div>
            )}
            {invoice.paidAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">تاريخ الدفع:</span>
                <span className="font-medium text-green-700">{fmtDate(invoice.paidAt)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">الحالة:</span>
              <span className={`font-semibold ${isPaid ? 'text-green-600' : invoice.status === 'Cancelled' ? 'text-red-500' : 'text-[#29AAFE]'}`}>
                {STATUS_AR[invoice.status] ?? invoice.status}
              </span>
            </div>
          </div>
        </div>

        {/* ── Line items table ─────────────────────────────────── */}
        <table className="w-full mb-6 text-sm">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="px-4 py-3 text-right rounded-tr-lg font-semibold">الخدمة / الوصف</th>
              <th className="px-4 py-3 text-center font-semibold w-16">الكمية</th>
              <th className="px-4 py-3 text-left font-semibold w-28">سعر الوحدة</th>
              <th className="px-4 py-3 text-left font-semibold w-28">تغطية التأمين</th>
              <th className="px-4 py-3 text-left font-semibold w-28 rounded-tl-lg">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((li, i) => (
              <tr key={li.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 text-gray-800">
                  {li.descriptionArabic || li.description}
                  {li.discountAmount > 0 && (
                    <div className="text-xs text-purple-500">خصم: - {fmt(li.discountAmount, invoice.currency)}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-center text-gray-600">{li.quantity}</td>
                <td className="px-4 py-3 text-left text-gray-600">{fmt(li.unitPrice, invoice.currency)}</td>
                <td className="px-4 py-3 text-left text-blue-600">
                  {li.insuranceCoverageAmount > 0 ? `- ${fmt(li.insuranceCoverageAmount, invoice.currency)}` : '—'}
                </td>
                <td className="px-4 py-3 text-left font-semibold text-gray-900">{fmt(li.lineTotal, invoice.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── Totals ──────────────────────────────────────────── */}
        <div className="flex justify-end mb-8">
          <div className="w-72 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600 py-1">
              <span>المجموع الفرعي</span>
              <span>{fmt(invoice.subTotal, invoice.currency)}</span>
            </div>
            {invoice.insuranceCoverageAmount > 0 && (
              <div className="flex justify-between text-blue-600 py-1">
                <span>تغطية التأمين</span>
                <span>- {fmt(invoice.insuranceCoverageAmount, invoice.currency)}</span>
              </div>
            )}
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-purple-600 py-1">
                <span>الخصم</span>
                <span>- {fmt(invoice.discountAmount, invoice.currency)}</span>
              </div>
            )}
            {invoice.taxAmount > 0 && (
              <div className="flex justify-between text-gray-600 py-1">
                <span>الضريبة</span>
                <span>+ {fmt(invoice.taxAmount, invoice.currency)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-gray-900 text-base py-2 border-t-2 border-gray-800 mt-1">
              <span>الإجمالي المستحق</span>
              <span className="text-[#29AAFE]">{fmt(invoice.totalDue, invoice.currency)}</span>
            </div>
            {invoice.totalPaid > 0 && (
              <div className="flex justify-between text-green-700 py-1 bg-green-50 rounded-lg px-2">
                <span>المدفوع</span>
                <span>- {fmt(invoice.totalPaid, invoice.currency)}</span>
              </div>
            )}
            {invoice.balance > 0 && (
              <div className="flex justify-between font-bold text-red-600 py-1.5 bg-red-50 rounded-lg px-2">
                <span>المتبقي</span>
                <span>{fmt(invoice.balance, invoice.currency)}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Installment plan ────────────────────────────────── */}
        {invoice.installmentPlan && (
          <div className="mb-8">
            <div className="text-sm font-bold text-gray-700 mb-3">
              خطة التقسيط — {invoice.installmentPlan.numberOfInstallments} أقساط
            </div>
            <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-right text-gray-600">القسط</th>
                  <th className="px-3 py-2 text-right text-gray-600">تاريخ الاستحقاق</th>
                  <th className="px-3 py-2 text-right text-gray-600">المبلغ</th>
                  <th className="px-3 py-2 text-right text-gray-600">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.installmentPlan.schedule.map((s, i) => (
                  <tr key={s.id}>
                    <td className="px-3 py-2 text-gray-700">{i + 1}</td>
                    <td className="px-3 py-2 text-gray-600">{fmtDate(s.dueDate)}</td>
                    <td className="px-3 py-2 font-medium">{fmt(s.amount, invoice.currency)}</td>
                    <td className="px-3 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        s.status === 'Paid' ? 'bg-green-100 text-green-700' :
                        s.status === 'Overdue' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {s.status === 'Paid' ? 'مدفوع' : s.status === 'Overdue' ? 'متأخر' : 'معلق'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Notes ───────────────────────────────────────────── */}
        {invoice.notes && (
          <div className="mb-8 bg-yellow-50 border border-yellow-100 rounded-xl p-4">
            <div className="text-xs font-bold text-yellow-700 mb-1">ملاحظات</div>
            <p className="text-sm text-gray-700">{invoice.notes}</p>
          </div>
        )}

        {/* ── Footer ──────────────────────────────────────────── */}
        <div className="border-t border-gray-200 pt-4 mt-auto">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>
              {clinic?.clinicName ?? 'العيادة'}
              {clinic?.phone ? ` · ${clinic.phone}` : ''}
              {clinic?.email ? ` · ${clinic.email}` : ''}
            </span>
            <span>تم إنشاء هذه الفاتورة إلكترونياً</span>
          </div>
        </div>

      </div>
      {/* Bottom breathing room */}
      <div className="no-print h-16" />
    </>
  );
}
