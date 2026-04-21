'use client';
import { useEffect, useState } from 'react';
import { discountService } from '@/domains/billing/billing.service';
import { getApiError } from '@/shared/utils';
import type { Discount, DiscountType, DiscountApplicationMethod, DiscountAppliesTo } from '@/domains/billing/billing.types';

const typeLabels: Record<DiscountType, string> = { Percentage: 'نسبة مئوية', FixedAmount: 'مبلغ ثابت', SessionPackage: 'باقة جلسات' };
const methodLabels: Record<DiscountApplicationMethod, string> = { Manual: 'يدوي', PromoCode: 'كود ترويجي', Automatic: 'تلقائي' };
const appliesToLabels: Record<DiscountAppliesTo, string> = { Appointment: 'موعد', TreatmentPlan: 'خطة علاج', SessionPackage: 'باقة', Any: 'الكل' };

const emptyForm = {
  name: '', nameArabic: '', code: '', type: 'Percentage' as DiscountType,
  value: 10, appliesTo: 'Any' as DiscountAppliesTo,
  applicationMethod: 'Manual' as DiscountApplicationMethod,
  isActive: true, startsAt: '', expiresAt: '',
  maxUsageTotal: '', maxUsagePerPatient: '',
};

export default function DiscountsSettingsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await discountService.getAll({ pageSize: '100' });
      setDiscounts(res.items);
    } catch { } finally { setLoading(false); }
  }

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function openCreate() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowModal(true);
  }

  function openEdit(d: Discount) {
    setForm({
      name: d.name, nameArabic: d.nameArabic ?? '', code: d.code ?? '',
      type: d.type, value: d.value, appliesTo: d.appliesTo,
      applicationMethod: d.applicationMethod, isActive: d.isActive,
      startsAt: d.startsAt ? d.startsAt.split('T')[0] : '',
      expiresAt: d.expiresAt ? d.expiresAt.split('T')[0] : '',
      maxUsageTotal: d.maxUsageTotal?.toString() ?? '',
      maxUsagePerPatient: d.maxUsagePerPatient?.toString() ?? '',
    });
    setEditingId(d.id);
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const body = {
        ...form,
        maxUsageTotal: form.maxUsageTotal ? Number(form.maxUsageTotal) : null,
        maxUsagePerPatient: form.maxUsagePerPatient ? Number(form.maxUsagePerPatient) : null,
        startsAt: form.startsAt || null,
        expiresAt: form.expiresAt || null,
        code: form.code || null,
      };
      if (editingId) {
        await discountService.update(editingId, body);
        showToast('تم تحديث الخصم', 'success');
      } else {
        await discountService.create(body);
        showToast('تم إنشاء الخصم', 'success');
      }
      await load();
      setShowModal(false);
    } catch (err) { showToast(getApiError(err, 'حدث خطأ'), 'error'); } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('هل تريد حذف هذا الخصم؟')) return;
    try {
      await discountService.delete(id);
      await load();
      showToast('تم الحذف', 'success');
    } catch (err) { showToast(getApiError(err, 'حدث خطأ'), 'error'); }
  }

  const filtered = discounts.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.code ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (active: boolean) => active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500';
  const typeColor: Record<DiscountType, string> = { Percentage: 'bg-blue-100 text-blue-700', FixedAmount: 'bg-purple-100 text-purple-700', SessionPackage: 'bg-orange-100 text-orange-700' };

  if (loading) return (
    <div dir="rtl" className="p-6 flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-[#29AAFE] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div dir="rtl" className="p-6 max-w-5xl mx-auto">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">العروض والخصومات</h1>
          <p className="text-sm text-gray-500 mt-1">إدارة كودات الخصم والعروض الخاصة</p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2 bg-[#29AAFE] text-white rounded-lg text-sm font-medium hover:bg-[#1a9aee]">
          + إضافة خصم جديد
        </button>
      </div>

      <div className="mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو الكود..."
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:border-[#29AAFE]" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">🏷️</div>
            <p className="text-gray-500 text-sm">لا توجد خصومات</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['الاسم', 'النوع', 'القيمة', 'التطبيق', 'ينتهي', 'الاستخدام', 'الحالة', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-right text-xs font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(d => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{d.name}</div>
                    {d.code && <div className="text-xs text-gray-400 mt-0.5 font-mono bg-gray-100 px-1.5 py-0.5 rounded inline-block">{d.code}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor[d.type]}`}>{typeLabels[d.type]}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-700">
                    {d.type === 'Percentage' ? `${d.value}%` : `${d.value} ج.م`}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{methodLabels[d.applicationMethod]}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {d.expiresAt ? new Date(d.expiresAt).toLocaleDateString('ar-EG') : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {d.usageCount}{d.maxUsageTotal ? `/${d.maxUsageTotal}` : ''}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(d.isActive)}`}>
                      {d.isActive ? 'فعّال' : 'غير فعّال'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(d)} className="text-xs text-gray-500 hover:text-[#29AAFE] px-2 py-1 rounded hover:bg-gray-100">تعديل</button>
                      <button onClick={() => handleDelete(d.id)} className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50">حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-semibold text-gray-800">{editingId ? 'تعديل الخصم' : 'إضافة خصم جديد'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">الاسم *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#29AAFE]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">الاسم بالعربية</label>
                  <input value={form.nameArabic} onChange={e => setForm(f => ({ ...f, nameArabic: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#29AAFE]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">نوع الخصم</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as DiscountType }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#29AAFE]">
                    {Object.entries(typeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">القيمة</label>
                  <input type="number" min={0} value={form.value} onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#29AAFE]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">طريقة التطبيق</label>
                  <select value={form.applicationMethod} onChange={e => setForm(f => ({ ...f, applicationMethod: e.target.value as DiscountApplicationMethod }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#29AAFE]">
                    {Object.entries(methodLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">ينطبق على</label>
                  <select value={form.appliesTo} onChange={e => setForm(f => ({ ...f, appliesTo: e.target.value as DiscountAppliesTo }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#29AAFE]">
                    {Object.entries(appliesToLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>

              {form.applicationMethod === 'PromoCode' && (
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">كود الخصم</label>
                  <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="مثال: RAMADAN25" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#29AAFE]" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">تاريخ البداية</label>
                  <input type="date" value={form.startsAt} onChange={e => setForm(f => ({ ...f, startsAt: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#29AAFE]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">تاريخ الانتهاء</label>
                  <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#29AAFE]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">الحد الأقصى الإجمالي</label>
                  <input type="number" min={0} value={form.maxUsageTotal} onChange={e => setForm(f => ({ ...f, maxUsageTotal: e.target.value }))}
                    placeholder="غير محدود" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#29AAFE]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">الحد الأقصى لكل مريض</label>
                  <input type="number" min={0} value={form.maxUsagePerPatient} onChange={e => setForm(f => ({ ...f, maxUsagePerPatient: e.target.value }))}
                    placeholder="غير محدود" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#29AAFE]" />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="rounded" />
                <span className="text-sm text-gray-700">فعّال</span>
              </label>
            </div>
            <div className="px-5 pb-4 flex gap-2 justify-end border-t pt-4">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">إلغاء</button>
              <button onClick={handleSave} disabled={saving || !form.name}
                className="px-4 py-2 bg-[#29AAFE] text-white rounded-lg text-sm font-medium hover:bg-[#1a9aee] disabled:opacity-50">
                {saving ? 'جاري الحفظ...' : editingId ? 'تحديث' : 'إنشاء'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
