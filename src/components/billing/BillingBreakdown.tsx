'use client';
import { useEffect, useState, useCallback } from 'react';
import { invoiceService, insuranceService, discountService } from '@/domains/billing/billing.service';
import type {
  BillingBreakdown,
  PatientInsurance,
  Discount,
  BillingServiceType,
} from '@/domains/billing/billing.types';

interface LineItemInput {
  description: string;
  descriptionArabic?: string;
  quantity: number;
  unitPrice: number;
  serviceType: BillingServiceType;
}

interface Props {
  patientId: string;
  lineItems: LineItemInput[];
  onBreakdownChange?: (breakdown: BillingBreakdown | null) => void;
}

export default function BillingBreakdownWidget({ patientId, lineItems, onBreakdownChange }: Props) {
  const [insurances, setInsurances] = useState<PatientInsurance[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [selectedInsuranceId, setSelectedInsuranceId] = useState<string>('');
  const [selectedDiscountIds, setSelectedDiscountIds] = useState<string[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [promoValidated, setPromoValidated] = useState(false);
  const [promoMsg, setPromoMsg] = useState('');
  const [breakdown, setBreakdown] = useState<BillingBreakdown | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [ins, dis] = await Promise.allSettled([
          insuranceService.getPatientInsurances(patientId),
          discountService.getAll({ isActive: 'true', pageSize: '50' }),
        ]);
        if (ins.status === 'fulfilled') setInsurances(ins.value);
        if (dis.status === 'fulfilled') setDiscounts(dis.value.items);
      } catch { }
    }
    if (patientId) loadOptions();
  }, [patientId]);

  const calculate = useCallback(async () => {
    if (lineItems.length === 0) return;
    setLoading(true);
    try {
      const result = await invoiceService.calculateBreakdown({
        patientId,
        patientInsuranceId: selectedInsuranceId || undefined,
        lineItems,
        discountIds: selectedDiscountIds.length > 0 ? selectedDiscountIds : undefined,
        promoCode: promoValidated ? promoCode : undefined,
      });
      setBreakdown(result);
      onBreakdownChange?.(result);
    } catch {
      setBreakdown(null);
      onBreakdownChange?.(null);
    } finally { setLoading(false); }
  }, [patientId, lineItems, selectedInsuranceId, selectedDiscountIds, promoCode, promoValidated]);

  useEffect(() => { calculate(); }, [calculate]);

  async function validatePromo() {
    if (!promoCode) return;
    try {
      const subTotal = lineItems.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
      const res = await discountService.validateCode({
        code: promoCode,
        patientId,
        appliesTo: 'Any',
        subTotal,
      });
      setPromoValidated(res.isValid);
      setPromoMsg(res.isValid ? `✓ خصم ${res.discountAmount} ج.م` : res.message ?? 'كود غير صالح');
    } catch { setPromoMsg('حدث خطأ'); }
  }

  const fmt = (n: number) => n.toLocaleString('ar-EG', { minimumFractionDigits: 2 });
  const currency = breakdown?.currency === 'EGP' ? 'ج.م' : (breakdown?.currency ?? 'ج.م');

  return (
    <div dir="rtl" className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b">
        <span className="text-sm font-semibold text-gray-700">حساب الفاتورة</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Insurance selector */}
        {insurances.length > 0 && (
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">تأمين المريض</label>
            <select value={selectedInsuranceId} onChange={e => setSelectedInsuranceId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#29AAFE]">
              <option value="">بدون تأمين</option>
              {insurances.filter(i => i.isActive).map(i => (
                <option key={i.id} value={i.id}>
                  {i.providerName} — {i.coveragePercent}% تغطية
                  {i.policyNumber ? ` (${i.policyNumber})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Discount selector */}
        {discounts.length > 0 && (
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">خصومات</label>
            <div className="flex flex-wrap gap-2">
              {discounts.filter(d => d.applicationMethod !== 'PromoCode').map(d => (
                <button key={d.id}
                  onClick={() => setSelectedDiscountIds(ids =>
                    ids.includes(d.id) ? ids.filter(i => i !== d.id) : [...ids, d.id]
                  )}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    selectedDiscountIds.includes(d.id)
                      ? 'border-[#29AAFE] bg-blue-50 text-[#29AAFE]'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}>
                  {d.nameArabic || d.name} ({d.type === 'Percentage' ? `${d.value}%` : `${d.value} ج.م`})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Promo code */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">كود ترويجي</label>
          <div className="flex gap-2">
            <input value={promoCode} onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoValidated(false); setPromoMsg(''); }}
              placeholder="أدخل الكود..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#29AAFE]" />
            <button onClick={validatePromo} disabled={!promoCode}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 disabled:opacity-40">
              تحقق
            </button>
          </div>
          {promoMsg && (
            <p className={`text-xs mt-1 ${promoValidated ? 'text-green-600' : 'text-red-500'}`}>{promoMsg}</p>
          )}
        </div>

        {/* Breakdown result */}
        {loading ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
            <div className="w-4 h-4 border-2 border-[#29AAFE] border-t-transparent rounded-full animate-spin" />
            جاري الحساب...
          </div>
        ) : breakdown && (
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>الإجمالي قبل الخصم</span>
              <span>{fmt(breakdown.subTotal)} {currency}</span>
            </div>
            {breakdown.insuranceCoverageAmount > 0 && (
              <div className="flex justify-between text-sm text-blue-600">
                <span>تغطية التأمين</span>
                <span>- {fmt(breakdown.insuranceCoverageAmount)} {currency}</span>
              </div>
            )}
            {breakdown.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-purple-600">
                <span>الخصم</span>
                <span>- {fmt(breakdown.discountAmount)} {currency}</span>
              </div>
            )}
            {breakdown.taxAmount > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>الضريبة</span>
                <span>+ {fmt(breakdown.taxAmount)} {currency}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-800">
              <span>المستحق على المريض</span>
              <span className="text-[#29AAFE]">{fmt(breakdown.patientDue)} {currency}</span>
            </div>
            {breakdown.insuranceDue > 0 && (
              <div className="flex justify-between text-xs text-blue-500">
                <span>يُحصَّل من التأمين</span>
                <span>{fmt(breakdown.insuranceDue)} {currency}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
