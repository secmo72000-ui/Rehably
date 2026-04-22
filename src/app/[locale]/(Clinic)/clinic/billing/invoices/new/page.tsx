'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { invoiceService, insuranceService } from '@/domains/billing/billing.service';
import { patientsService } from '@/domains/patients/patients.service';
import type { PatientListItem } from '@/domains/patients/patients.types';
import type { PatientInsurance, BillingBreakdown } from '@/domains/billing/billing.types';
import { getApiError } from '@/shared/utils';
import Link from 'next/link';

interface LineItem {
  description: string;
  descriptionArabic: string;
  quantity: number;
  unitPrice: number;
  serviceType: number; // 0=Session, 1=Assessment, 2=Package
}

const CURRENCIES = ['EGP', 'SAR', 'AED', 'USD'];
const CURRENCY_SYMBOLS: Record<string, string> = { EGP: 'ج.م', SAR: 'ر.س', AED: 'د.إ', USD: '$' };
const SERVICE_LABELS = ['جلسة علاجية', 'تقييم', 'باقة'];

const EMPTY_ITEM: LineItem = { description: '', descriptionArabic: '', quantity: 1, unitPrice: 0, serviceType: 0 };

export default function NewInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale as string ?? 'ar';

  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [patientInsurances, setPatientInsurances] = useState<PatientInsurance[]>([]);
  const [selectedInsurance, setSelectedInsurance] = useState<PatientInsurance | null>(null);

  const [patientId, setPatientId] = useState('');
  const [currency, setCurrency] = useState('EGP');
  const [selectedInsuranceId, setSelectedInsuranceId] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: 'Physical Therapy Session', descriptionArabic: 'جلسة علاج طبيعي', quantity: 1, unitPrice: 0, serviceType: 0 },
  ]);

  const [breakdown, setBreakdown] = useState<BillingBreakdown | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const calcTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sym = CURRENCY_SYMBOLS[currency] ?? currency;
  const fmt = (n: number) => `${n.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ${sym}`;

  // Load patients
  useEffect(() => {
    patientsService.getAll({ page: 1, pageSize: 200 })
      .then(r => setPatients(r.items ?? []))
      .catch(() => setPatients([]));
  }, []);

  // Load patient insurances when patient changes
  useEffect(() => {
    if (!patientId) { setPatientInsurances([]); setSelectedInsuranceId(''); setSelectedInsurance(null); return; }
    insuranceService.getPatientInsurances(patientId)
      .then(ins => { setPatientInsurances(ins); })
      .catch(() => setPatientInsurances([]));
  }, [patientId]);

  // Sync selected insurance object
  useEffect(() => {
    setSelectedInsurance(patientInsurances.find(i => i.id === selectedInsuranceId) ?? null);
  }, [selectedInsuranceId, patientInsurances]);

  // Recalculate breakdown (debounced)
  useEffect(() => {
    const validItems = lineItems.filter(li => li.unitPrice > 0 && li.quantity > 0);
    if (!patientId || validItems.length === 0) { setBreakdown(null); return; }
    if (calcTimer.current) clearTimeout(calcTimer.current);
    calcTimer.current = setTimeout(async () => {
      setCalcLoading(true);
      try {
        const result = await invoiceService.calculateBreakdown({
          patientId,
          patientInsuranceId: selectedInsuranceId || undefined,
          lineItems: validItems.map(li => ({
            description: li.description || li.descriptionArabic,
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
    return () => { if (calcTimer.current) clearTimeout(calcTimer.current); };
  }, [patientId, selectedInsuranceId, promoCode, lineItems]);

  const addLineItem = () => setLineItems(p => [...p, { ...EMPTY_ITEM }]);
  const removeLineItem = (i: number) => setLineItems(p => p.filter((_, idx) => idx !== i));
  const updateLineItem = (i: number, field: keyof LineItem, value: string | number) =>
    setLineItems(p => p.map((li, idx) => idx === i ? { ...li, [field]: value } : li));

  const handleSubmit = async () => {
    if (!patientId) { setError('يرجى اختيار المريض'); return; }
    const validItems = lineItems.filter(li => (li.description || li.descriptionArabic) && li.unitPrice > 0 && li.quantity > 0);
    if (validItems.length === 0) { setError('أضف بنداً واحداً على الأقل بسعر صحيح'); return; }

    setSaving(true); setError(null);
    try {
      const inv = await invoiceService.create({
        patientId,
        currency,
        lineItems: validItems.map(li => ({
          description: li.description || li.descriptionArabic,
          descriptionArabic: li.descriptionArabic || undefined,
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

  const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#29AAFE] focus:ring-2 focus:ring-[#29AAFE]/10 bg-white';
  const subtotal = lineItems.reduce((s, li) => s + li.quantity * li.unitPrice, 0);

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

        {/* ── Patient + Currency ───────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-gray-700">بيانات المريض والفاتورة</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-600 mb-1.5">المريض *</label>
              <select value={patientId} onChange={e => setPatientId(e.target.value)} className={inputCls}>
                <option value="">اختر المريض</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">العملة</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)} className={inputCls}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Insurance — only shown when patient has active insurances */}
          {patientInsurances.filter(i => i.isActive).length > 0 && (
            <div className="border border-blue-100 bg-blue-50/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700">التأمين الصحي</span>
                {selectedInsurance && (
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                    تغطية {selectedInsurance.coveragePercent}%
                  </span>
                )}
              </div>
              <select value={selectedInsuranceId} onChange={e => setSelectedInsuranceId(e.target.value)} className={inputCls}>
                <option value="">بدون تأمين</option>
                {patientInsurances.filter(i => i.isActive).map(i => (
                  <option key={i.id} value={i.id}>
                    {i.providerNameArabic || i.providerName} — {i.coveragePercent}% تغطية
                    {i.policyNumber ? ` (${i.policyNumber})` : ''}
                  </option>
                ))}
              </select>
              {selectedInsurance && (
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  {selectedInsurance.policyNumber && (
                    <div><span className="text-gray-400">رقم البوليصة: </span>{selectedInsurance.policyNumber}</div>
                  )}
                  {selectedInsurance.membershipId && (
                    <div><span className="text-gray-400">رقم العضوية: </span>{selectedInsurance.membershipId}</div>
                  )}
                  {selectedInsurance.holderName && (
                    <div><span className="text-gray-400">المؤمن عليه: </span>{selectedInsurance.holderName}</div>
                  )}
                  {selectedInsurance.expiryDate && (
                    <div><span className="text-gray-400">انتهاء: </span>{new Date(selectedInsurance.expiryDate).toLocaleDateString('ar-EG')}</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Line items ───────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-700">بنود الخدمة</h2>
            <button onClick={addLineItem}
              className="text-xs font-bold text-[#29AAFE] hover:underline">
              + إضافة بند
            </button>
          </div>

          <div className="space-y-4">
            {lineItems.map((li, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-3 space-y-2 relative">
                {/* Remove button */}
                {lineItems.length > 1 && (
                  <button onClick={() => removeLineItem(i)}
                    className="absolute top-3 left-3 w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full text-sm">
                    ×
                  </button>
                )}
                {/* Row 1: descriptions */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">الوصف (عربي)</label>
                    <input value={li.descriptionArabic}
                      onChange={e => updateLineItem(i, 'descriptionArabic', e.target.value)}
                      placeholder="وصف الخدمة بالعربية"
                      className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Description (English)</label>
                    <input value={li.description}
                      onChange={e => updateLineItem(i, 'description', e.target.value)}
                      placeholder="Service description"
                      className={inputCls} dir="ltr" />
                  </div>
                </div>
                {/* Row 2: type, qty, price, total */}
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">النوع</label>
                    <select value={li.serviceType}
                      onChange={e => updateLineItem(i, 'serviceType', Number(e.target.value))}
                      className={inputCls}>
                      {SERVICE_LABELS.map((l, v) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">الكمية</label>
                    <input type="number" min="1" value={li.quantity}
                      onChange={e => updateLineItem(i, 'quantity', Number(e.target.value))}
                      className={inputCls} dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">سعر الوحدة</label>
                    <input type="number" min="0" step="0.01" value={li.unitPrice || ''}
                      onChange={e => updateLineItem(i, 'unitPrice', Number(e.target.value))}
                      placeholder="0.00" className={inputCls} dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">الإجمالي</label>
                    <div className="border border-gray-100 bg-gray-50 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 text-left" dir="ltr">
                      {(li.quantity * li.unitPrice).toLocaleString('ar-EG', { minimumFractionDigits: 2 })} {sym}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Subtotal */}
          {subtotal > 0 && (
            <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-500">المجموع الفرعي: </span>
              <span className="text-sm font-bold text-gray-800 mr-2">{fmt(subtotal)}</span>
            </div>
          )}
        </div>

        {/* ── Extras ───────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-gray-700">خصومات وتفاصيل إضافية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">كود خصم (اختياري)</label>
              <input value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())}
                placeholder="أدخل الكود" className={inputCls} dir="ltr" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">تاريخ الاستحقاق</label>
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

        {/* ── Breakdown preview ────────────────────────────────── */}
        {patientId && subtotal > 0 && (
          <div className="bg-gray-900 text-white rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold">ملخص الفاتورة</h2>
              {calcLoading && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <div className="w-3 h-3 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
                  جاري الحساب…
                </div>
              )}
            </div>

            {breakdown ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>المجموع الفرعي</span>
                  <span dir="ltr">{fmt(breakdown.subTotal)}</span>
                </div>
                {breakdown.insuranceCoverageAmount > 0 && (
                  <div className="flex justify-between text-blue-300">
                    <span>تغطية التأمين ({selectedInsurance?.coveragePercent}%)</span>
                    <span dir="ltr">- {fmt(breakdown.insuranceCoverageAmount)}</span>
                  </div>
                )}
                {breakdown.discountAmount > 0 && (
                  <div className="flex justify-between text-purple-300">
                    <span>الخصم</span>
                    <span dir="ltr">- {fmt(breakdown.discountAmount)}</span>
                  </div>
                )}
                {breakdown.taxAmount > 0 && (
                  <div className="flex justify-between text-yellow-300">
                    <span>ضريبة القيمة المضافة (VAT)</span>
                    <span dir="ltr">+ {fmt(breakdown.taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-700 mt-2">
                  <span>الإجمالي المستحق</span>
                  <span className="text-[#29AAFE]" dir="ltr">{fmt(breakdown.totalDue)}</span>
                </div>
                {/* Patient vs insurer split */}
                {breakdown.insuranceCoverageAmount > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700 space-y-1.5">
                    <div className="text-xs text-gray-400 font-bold mb-2">توزيع الدفع</div>
                    <div className="flex justify-between text-sm text-blue-300">
                      <span>يدفعها التأمين</span>
                      <span dir="ltr">{fmt(breakdown.insuranceDue)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-300">
                      <span>يدفعها المريض</span>
                      <span dir="ltr">{fmt(breakdown.patientDue)}</span>
                    </div>
                  </div>
                )}
                {breakdown.taxAmount > 0 && (
                  <p className="text-xs text-yellow-200/60 mt-2">
                    * فاتورة ضريبية — VAT مفصل ومحسوب
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400">أدخل سعراً لعرض الملخص</p>
            )}
          </div>
        )}

        {/* ── Actions ──────────────────────────────────────────── */}
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
