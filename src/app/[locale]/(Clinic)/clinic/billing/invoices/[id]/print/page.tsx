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
const CURRENCY_SYM: Record<string, string> = { EGP: 'ج.م', SAR: 'ر.س', AED: 'د.إ', USD: '$' };

const fmt = (n: number, currency = 'EGP') =>
  `${n.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ${CURRENCY_SYM[currency] ?? currency}`;

const fmtDate = (s?: string) =>
  s ? new Date(s).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

export default function InvoicePrintPage() {
  const params = useParams();
  const id = params?.id as string;

  const [invoice, setInvoice] = useState<ClinicInvoice | null>(null);
  const [clinic, setClinic] = useState<ClinicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      invoiceService.getById(id),
      apiClient.get<{ success?: boolean; data?: ClinicProfile }>('/api/clinic/profile')
        .then(r => r.data?.data ?? (r.data as unknown as ClinicProfile))
        .catch(() => null),
    ]).then(([inv, prof]) => {
      setInvoice(inv);
      setClinic(prof);
    }).finally(() => setLoading(false));
  }, [id]);

  // Auto-print once data ready
  useEffect(() => {
    if (!loading && invoice) {
      const t = setTimeout(() => window.print(), 500);
      return () => clearTimeout(t);
    }
  }, [loading, invoice]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="w-10 h-10 border-4 border-[#29AAFE] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!invoice) return (
    <div className="flex items-center justify-center h-screen text-gray-500">لم يتم العثور على الفاتورة</div>
  );

  const isVat = invoice.taxAmount > 0;
  const isTaxInvoice = isVat;
  const isPaid = invoice.status === 'Paid';
  const isCancelled = invoice.status === 'Cancelled';
  const hasInsurance = invoice.insuranceCoverageAmount > 0;
  // Patient pays the totalDue (already net of insurance). Insurer covers insuranceCoverageAmount.
  const patientDue = invoice.totalDue;
  const insurerDue = invoice.insuranceCoverageAmount;
  const cur = invoice.currency;
  const clinicDisplayName = clinic?.nameArabic || clinic?.clinicName || 'العيادة';

  // QR data: invoice number + id for verification
  const qrData = encodeURIComponent(`${invoice.invoiceNumber}|${invoice.id}`);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=88x88&data=${qrData}&color=111827&bgcolor=ffffff&margin=4`;

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff; margin: 0; }
          .print-page { box-shadow: none !important; margin: 0 !important; border: none !important; }
        }
        @page { size: A4; margin: 12mm 16mm; }
        body { font-family: 'Segoe UI', Tahoma, 'Noto Sans Arabic', Arial, sans-serif; background: #f3f4f6; }
      `}</style>

      {/* ── Toolbar (hidden on print) ─────────────────────────── */}
      <div className="no-print fixed top-0 inset-x-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm" dir="rtl">
        <button onClick={() => window.history.back()}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          ← رجوع
        </button>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-3 py-1 rounded-full font-bold ${isTaxInvoice ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
            {isTaxInvoice ? 'TAX INVOICE — فاتورة ضريبية' : 'INVOICE — فاتورة'}
          </span>
          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2 bg-[#29AAFE] text-white rounded-lg text-sm font-bold hover:bg-[#1a9aee]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            طباعة / حفظ PDF
          </button>
        </div>
      </div>

      <div className="no-print h-16" />

      {/* ── A4 Sheet ─────────────────────────────────────────────── */}
      <div dir="rtl" className="print-page bg-white mx-auto shadow-lg"
        style={{ width: '210mm', minHeight: '297mm', padding: '16mm 18mm 14mm' }}>

        {/* ── Header ───────────────────────────────────────────── */}
        <div className="flex items-start justify-between pb-5 mb-5 border-b-2 border-gray-900">

          {/* Clinic branding */}
          <div className="flex items-start gap-3">
            {clinic?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={clinic.logoUrl} alt="logo" className="w-14 h-14 object-contain rounded-xl" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#60a5fa] to-[#29AAFE] flex items-center justify-center text-white font-black text-xl">
                {clinicDisplayName.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-xl font-black text-gray-900">{clinicDisplayName}</h1>
              {clinic?.specialty && <p className="text-xs text-gray-500 mt-0.5">{clinic.specialty}</p>}
              {(clinic?.address || clinic?.city) && (
                <p className="text-xs text-gray-500 mt-1">
                  {[clinic.address, clinic.city, clinic.region].filter(Boolean).join(' — ')}
                </p>
              )}
              <div className="flex gap-4 mt-1">
                {clinic?.phone && <p className="text-xs text-gray-500">📞 {clinic.phone}</p>}
                {clinic?.email && <p className="text-xs text-gray-500">✉ {clinic.email}</p>}
              </div>
            </div>
          </div>

          {/* Invoice badge + QR */}
          <div className="flex items-start gap-4">
            <div className="text-left">
              <div className="text-2xl font-black text-[#29AAFE]">
                {isTaxInvoice ? 'فاتورة ضريبية' : 'فاتورة'}
              </div>
              {isTaxInvoice && (
                <div className="text-[10px] text-yellow-700 bg-yellow-100 rounded px-2 py-0.5 mt-1 inline-block font-bold">
                  TAX INVOICE — VAT مفصّل
                </div>
              )}
              <div className="font-mono font-bold text-gray-800 text-base mt-1 text-left" dir="ltr">
                {invoice.invoiceNumber}
              </div>
              {/* Status stamp */}
              {isPaid && (
                <div className="mt-1.5 inline-block border-2 border-green-500 rounded text-green-600 font-black text-xs px-2 py-0.5 rotate-[-6deg]">
                  مدفوعة ✓
                </div>
              )}
              {isCancelled && (
                <div className="mt-1.5 inline-block border-2 border-red-400 rounded text-red-500 font-black text-xs px-2 py-0.5 rotate-[-6deg]">
                  ملغاة ✗
                </div>
              )}
            </div>
            {/* QR code */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt="QR" width={88} height={88}
              className="rounded-lg border border-gray-200"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        </div>

        {/* ── Seller / Patient ─────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="border border-gray-200 rounded-xl p-4">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Seller — العيادة</div>
            <div className="font-bold text-gray-900">{clinicDisplayName}</div>
            {clinic?.address && <div className="text-xs text-gray-500 mt-1">{clinic.address}</div>}
            {clinic?.phone && <div className="text-xs text-gray-500">📞 {clinic.phone}</div>}
          </div>
          <div className="border border-gray-200 rounded-xl p-4">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Customer — المريض</div>
            <div className="font-bold text-gray-900">{invoice.patientName}</div>
            <div className="text-xs text-gray-500 mt-1 font-mono">
              Patient ID: {invoice.patientId.slice(0, 8).toUpperCase()}
            </div>
          </div>
        </div>

        {/* ── Invoice meta row ─────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-3 mb-5 text-xs">
          {[
            { label: 'تاريخ الإصدار', value: fmtDate(invoice.issuedAt || invoice.createdAt) },
            { label: 'تاريخ الاستحقاق', value: fmtDate(invoice.dueDate) },
            { label: 'الحالة', value: STATUS_AR[invoice.status] ?? invoice.status },
            { label: 'العملة', value: cur },
          ].map(({ label, value }) => (
            <div key={label} className="border border-gray-100 rounded-xl p-3 bg-gray-50">
              <div className="text-gray-400 mb-1">{label}</div>
              <div className="font-bold text-gray-800">{value}</div>
            </div>
          ))}
        </div>

        {/* ── Line items ───────────────────────────────────────── */}
        <div className="mb-5">
          <div className="font-bold text-gray-800 text-sm mb-2">بنود الخدمة</div>
          <table className="w-full text-sm border-collapse overflow-hidden"
            style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            <thead>
              <tr style={{ background: '#111827', color: '#fff' }}>
                {['الخدمة / الوصف', 'الكمية', 'سعر الوحدة', 'تأمين', 'إجمالي البند'].map((h, i) => (
                  <th key={h} className={`px-3 py-2.5 text-right text-xs font-bold ${i === 4 ? 'text-left' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((li, i) => (
                <tr key={li.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                  <td className="px-3 py-2.5 text-gray-800">
                    <div>{li.descriptionArabic || li.description}</div>
                    {li.discountAmount > 0 && (
                      <div className="text-[10px] text-purple-500">خصم: - {fmt(li.discountAmount, cur)}</div>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center text-gray-600">{li.quantity}</td>
                  <td className="px-3 py-2.5 text-gray-600 font-mono" dir="ltr">{fmt(li.unitPrice, cur)}</td>
                  <td className="px-3 py-2.5 text-blue-600 font-mono text-xs" dir="ltr">
                    {li.insuranceCoverageAmount > 0 ? `- ${fmt(li.insuranceCoverageAmount, cur)}` : '—'}
                  </td>
                  <td className="px-3 py-2.5 font-bold text-gray-900 font-mono text-left" dir="ltr">
                    {fmt(li.lineTotal, cur)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Totals ───────────────────────────────────────────── */}
        <div className="flex justify-end mb-5">
          <div className="w-80 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500 py-0.5">
              <span>المجموع الفرعي (Subtotal)</span>
              <span className="font-mono" dir="ltr">{fmt(invoice.subTotal, cur)}</span>
            </div>
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-purple-600 py-0.5">
                <span>الخصم (Discount)</span>
                <span className="font-mono" dir="ltr">- {fmt(invoice.discountAmount, cur)}</span>
              </div>
            )}
            {hasInsurance && (
              <div className="flex justify-between text-blue-600 py-0.5">
                <span>تغطية التأمين (Insurance)</span>
                <span className="font-mono" dir="ltr">- {fmt(invoice.insuranceCoverageAmount, cur)}</span>
              </div>
            )}
            {/* VAT row — only if taxAmount > 0 */}
            {isVat && (
              <div className="flex justify-between text-yellow-700 py-0.5">
                <span>ضريبة القيمة المضافة (VAT)</span>
                <span className="font-mono" dir="ltr">+ {fmt(invoice.taxAmount, cur)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-gray-900 text-base pt-2 mt-1"
              style={{ borderTop: '2px solid #111827' }}>
              <span>الإجمالي المستحق</span>
              <span className="text-[#29AAFE] font-mono" dir="ltr">{fmt(invoice.totalDue, cur)}</span>
            </div>
            {invoice.totalPaid > 0 && (
              <div className="flex justify-between text-green-700 py-1 px-2 rounded-lg"
                style={{ background: '#ecfdf5' }}>
                <span>المدفوع</span>
                <span className="font-mono font-bold" dir="ltr">- {fmt(invoice.totalPaid, cur)}</span>
              </div>
            )}
            {invoice.balance > 0 && (
              <div className="flex justify-between text-red-700 font-bold py-1 px-2 rounded-lg"
                style={{ background: '#fef2f2' }}>
                <span>المتبقي</span>
                <span className="font-mono" dir="ltr">{fmt(invoice.balance, cur)}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Insurance split ──────────────────────────────────── */}
        {hasInsurance && (
          <div className="mb-5 border border-blue-100 rounded-xl p-4 bg-blue-50/40">
            <div className="text-xs font-black text-blue-700 mb-3 uppercase tracking-wider">توزيع الدفع — Insurance Split</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white rounded-xl p-3 border border-blue-100">
                <div className="text-[10px] text-gray-400 mb-1">يدفعها المريض (Patient Pays)</div>
                <div className="font-black text-green-700 font-mono" dir="ltr">{fmt(patientDue, cur)}</div>
              </div>
              <div className="bg-white rounded-xl p-3 border border-blue-100">
                <div className="text-[10px] text-gray-400 mb-1">يدفعها التأمين (Insurer Pays)</div>
                <div className="font-black text-blue-700 font-mono" dir="ltr">{fmt(insurerDue, cur)}</div>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              * التوزيع محسوب على الإجمالي النهائي {isVat ? '(شامل VAT)' : '(بدون VAT)'}.
            </p>
          </div>
        )}

        {/* ── Installment plan ─────────────────────────────────── */}
        {invoice.installmentPlan && (
          <div className="mb-5">
            <div className="text-xs font-bold text-gray-700 mb-2">
              خطة التقسيط — {invoice.installmentPlan.numberOfInstallments} أقساط
            </div>
            <table className="w-full text-xs border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  {['القسط', 'تاريخ الاستحقاق', 'المبلغ', 'الحالة'].map(h => (
                    <th key={h} className="px-3 py-2 text-right text-gray-600 font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.installmentPlan.schedule.map((s, i) => (
                  <tr key={s.id}>
                    <td className="px-3 py-2 text-gray-700">{i + 1}</td>
                    <td className="px-3 py-2 text-gray-600">{fmtDate(s.dueDate)}</td>
                    <td className="px-3 py-2 font-mono font-bold" dir="ltr">{fmt(s.amount, cur)}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === 'Paid' ? 'bg-green-100 text-green-700' :
                        s.status === 'Overdue' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
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

        {/* ── Notes ────────────────────────────────────────────── */}
        {invoice.notes && (
          <div className="mb-5 bg-yellow-50 border border-yellow-100 rounded-xl p-3">
            <div className="text-[10px] font-bold text-yellow-700 mb-1">ملاحظات</div>
            <p className="text-sm text-gray-700">{invoice.notes}</p>
          </div>
        )}

        {/* ── VAT disclaimer ───────────────────────────────────── */}
        {isVat && (
          <div className="mb-4 text-[10px] text-yellow-700 bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2">
            هذه فاتورة ضريبية رسمية — Tax Invoice: VAT محسوب ومفصّل على الإجمالي (بعد الخصم). يُرجى الاحتفاظ بها للأغراض الضريبية.
          </div>
        )}

        {/* ── Footer ───────────────────────────────────────────── */}
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginTop: 'auto' }}>
          <div className="flex items-center justify-between text-[10px] text-gray-400">
            <span>
              {clinicDisplayName}
              {clinic?.phone ? ` · ${clinic.phone}` : ''}
              {clinic?.email ? ` · ${clinic.email}` : ''}
            </span>
            <div className="text-left font-mono" dir="ltr">
              <div>{invoice.invoiceNumber}</div>
              <div>تم الإنشاء إلكترونياً · {new Date().toLocaleDateString('ar-EG')}</div>
            </div>
          </div>
        </div>

      </div>
      <div className="no-print h-10" />
    </>
  );
}
