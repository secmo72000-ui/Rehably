'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { invoiceService, insuranceService } from '@/domains/billing/billing.service';
import { patientsService } from '@/domains/patients/patients.service';
import type { PatientListItem } from '@/domains/patients/patients.types';
import type { PatientInsurance, BillingBreakdown } from '@/domains/billing/billing.types';
import { getApiError } from '@/shared/utils';
import Link from 'next/link';

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  serviceType: number; // 0=Session, 1=Assessment, 2=Package
}

const serviceTypeLabels = ['جلسة علاجية', 'تقييم', 'باقة'];

export default function NewInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale as string ?? 'ar';

  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [patientInsurances, setPatientInsurances] = useState<PatientInsurance[]>([]);

  const [patientId, setPatientId] = useState('');
  const [selectedInsuranceId, setSelectedInsuranceId] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: 'جلسة علاجية', quantity: 1, unitPrice: 0, serviceType: 0 },
  ]);

  const [breakdown, setBreakdown] = useState<BillingBreakdown | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load patients on mount
  useEffect(() => {
    patientsService.getAll({ page: 1, pageSize: 200 })
      .then(r => setPatients(r.items ?? []))
      .catch(() => setPatients([]));
  }, []);

  // Load patient insurances when patient changes
  useEffect(() => {
    if (!patientId) { setPatientInsurances([]); setSelectedInsuranceId(''); return; }
    insuranceService.getPatientInsurances(patientId)
      .then(setPatientInsurances)
      .catch(() => setPatientInsurances([]));
  }, [patientId]);

  // Recalculate breakdown when relevant fields change
  useEffect(() => {
    const validItems = lineItems.filter(li => li.unitPrice > 0 && li.quantity > 0);
    if (!patientId || validItems.length === 0) { setBreakdown(null); return; }

    const t = setTimeout(async () => {
      setCalcLoading(true);
      try {
        const result = await invoiceService.calculateBreakdown({
          patientId,
          patientInsuranceId: selectedInsuranceId || undefined,
          lineItems: validItems.map(li => ({
            description: li.description,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
            serviceType: li.serviceType,
          })),
          promoCode: promoCode || undefined,
        });
        setBreakdown(result);
      } catch { setBreakdown(null); }
      finally { setCalcLoading(false); }
    }, 600);
    return () => clearTimeout(t);
  }, [patientId, selectedInsuranceId, promoCode, lineItems]);

  const addLineItem = () =>
    setLineItems(prev => [...prev, { description: 'جلسة علاجية', quantity: 1, unitPrice: 0, serviceType: 0 }]);

  const removeLineItem = (i: number) =>
    setLineItems(prev => prev.filter((_, idx) => idx !== i));

  const updateLineItem = (i: number, field: keyof LineItem, value: string | number) =>
    setLineItems(prev => prev.map((li, idx) => idx === i ? { ...li, [field]: value } : li));

  const handleSubmit = async () => {
    if (!patientId) { setError('يرجى اختيار المريض'); return; }
    const validItems = lineItems.filter(li => li.description && li.unitPrice > 0 && li.quantity > 0);
    if (validItems.length === 0) { setError('أضف بنداً واحداً على الأقل بسعر صحيح'); return; }

    setSaving(true); setError(null);
    try {
      const inv = await invoiceService.create({
        patientId,
        currency: 'EGP',
        lineItems: validItems.map(li => ({
          description: li.description,
          quantity: li.quantity,
          unitPrice: li.unitPrice,
          serviceType: li.serviceType,
        })),
        patientInsuranceId: selectedInsuranceId || undefined,
        promoCode: promoCode || undefined,
        notes: notes || undefined,
        dueDate: dueDate || undefined,
      });
      router.push(`/${locale}/clinic/billing/invoices/${inv.id}`);
    } catch (err) {
      setError(getApiError(err, 'فشل في إنشاء الفاتورة'));
    } finally { setSaving(false); }
  };

  const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#29AAFE] focus:ring-2 focus:ring-[#29AAFE]/10';
  const fmt = (n: number) => n.toLocaleString('ar-EG', { minimumFractionDigits: 2 });

  return (
    <div dir="rtl" className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/${locale}/clinic/billing/invoices`}
          className="text-sm text-gray-400 hover:text-[#29AAFE] flex items-center gap-1 mb-2">
          ← العودة للفواتير
        </Link>
        <h1 className="text-xl font-bold text-gray-800">فاتورة جديدة</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
          {error}
        </div>
      )}

      <div className="space-y-5">
        {/* Patient */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-gray-700">بيانات المريض</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">المريض *</label>
              <select value={patientId} onChange={e => setPatientId(e.target.value)}
                className={`${inputCls} bg-white`}>
                <option value="">اختر المريض</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                ))}
              </select>
            </div>
            {patientInsurances.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">تأمين المريض</label>
                <select value={selectedInsuranceId} onChange={e => setSelectedInsuranceId(e.target.value)}
                  className={`${inputCls} bg-white`}>
                  <option value="">بدون تأمين</option>
                  {patientInsurances.filter(i => i.isActive).map(i => (
                    <option key={i.id} value={i.id}>
                      {i.providerNameArabic || i.providerName} — {i.coveragePercent}% تغطية
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Line items */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-700">بنود الفاتورة</h2>
            <button onClick={addLineItem}
              className="text-xs text-[#29AAFE] font-medium hover:underline">
              + إضافة بند
            </button>
          </div>

          <div className="space-y-3">
            {lineItems.map((li, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-start">
                {/* Description */}
                <div className="col-span-4">
                  {i === 0 && <label className="block text-xs text-gray-500 mb-1">الخدمة</label>}
                  <input value={li.description}
                    onChange={e => updateLineItem(i, 'description', e.target.value)}
                    placeholder="وصف الخدمة"
                    className={inputCls} />
                </div>
                {/* Service type */}
                <div className="col-span-3">
                  {i === 0 && <label className="block text-xs text-gray-500 mb-1">النوع</label>}
                  <select value={li.serviceType}
                    onChange={e => updateLineItem(i, 'serviceType', Number(e.target.value))}
                    className={`${inputCls} bg-white`}>
                    {serviceTypeLabels.map((l, v) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                {/* Quantity */}
                <div className="col-span-2">
                  {i === 0 && <label className="block text-xs text-gray-500 mb-1">الكمية</label>}
                  <input type="number" min="1" value={li.quantity}
                    onChange={e => updateLineItem(i, 'quantity', Number(e.target.value))}
                    className={inputCls} dir="ltr" />
                </div>
                {/* Unit price */}
                <div className="col-span-2">
                  {i === 0 && <label className="block text-xs text-gray-500 mb-1">السعر</label>}
                  <input type="number" min="0" step="0.01" value={li.unitPrice || ''}
                    onChange={e => updateLineItem(i, 'unitPrice', Number(e.target.value))}
                    placeholder="0.00"
                    className={inputCls} dir="ltr" />
                </div>
                {/* Remove */}
                <div className="col-span-1 flex items-end pb-0.5">
                  {i === 0 && <div className="h-5 mb-1" />}
                  {lineItems.length > 1 && (
                    <button onClick={() => removeLineItem(i)}
                      className="w-full h-[38px] flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-colors">
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discounts & extras */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-gray-700">خصومات وإضافات</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">كود خصم (اختياري)</label>
              <input value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())}
                placeholder="أدخل الكود" className={inputCls} dir="ltr" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">تاريخ الاستحقاق (اختياري)</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">ملاحظات</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              rows={2} placeholder="ملاحظات اختيارية..." className={`${inputCls} resize-none`} />
          </div>
        </div>

        {/* Breakdown preview */}
        {patientId && lineItems.some(li => li.unitPrice > 0) && (
          <div className="bg-[#F8FAFC] border border-gray-100 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-gray-700 mb-3">ملخص الفاتورة</h2>
            {calcLoading ? (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-3 h-3 border-2 border-[#29AAFE] border-t-transparent rounded-full animate-spin" />
                جاري الحساب…
              </div>
            ) : breakdown ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>الإجمالي قبل الخصم</span>
                  <span>{fmt(breakdown.subTotal)} ج.م</span>
                </div>
                {breakdown.insuranceCoverageAmount > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>تغطية التأمين</span>
                    <span>- {fmt(breakdown.insuranceCoverageAmount)} ج.م</span>
                  </div>
                )}
                {breakdown.discountAmount > 0 && (
                  <div className="flex justify-between text-purple-600">
                    <span>الخصم</span>
                    <span>- {fmt(breakdown.discountAmount)} ج.م</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-gray-200">
                  <span>الإجمالي المستحق</span>
                  <span className="text-[#29AAFE] text-base">{fmt(breakdown.totalDue)} ج.م</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">أدخل سعراً لعرض الملخص</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end pb-8">
          <Link href={`/${locale}/clinic/billing/invoices`}
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            إلغاء
          </Link>
          <button onClick={handleSubmit} disabled={saving}
            className="px-6 py-2.5 bg-[#29AAFE] text-white rounded-xl text-sm font-medium hover:bg-[#1a9aee] disabled:opacity-50 flex items-center gap-2">
            {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {saving ? 'جاري الحفظ...' : 'إنشاء الفاتورة'}
          </button>
        </div>
      </div>
    </div>
  );
}
