'use client';
import { useEffect, useState } from 'react';
import { insuranceService } from '@/domains/billing/billing.service';
import type { ClinicInsuranceProvider, InsuranceProvider } from '@/domains/billing/billing.types';

export default function InsuranceSettingsPage() {
  const [providers, setProviders] = useState<ClinicInsuranceProvider[]>([]);
  const [globalProviders, setGlobalProviders] = useState<InsuranceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selected, setSelected] = useState<ClinicInsuranceProvider | null>(null);
  const [searchGlobal, setSearchGlobal] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Add modal state
  const [addForm, setAddForm] = useState({
    insuranceProviderId: '',
    preAuthRequired: false,
    defaultCoveragePercent: 80,
    notes: '',
  });

  // Edit modal state
  const [editForm, setEditForm] = useState({
    preAuthRequired: false,
    defaultCoveragePercent: 80,
    notes: '',
  });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [cp, gp] = await Promise.all([
        insuranceService.getClinicProviders(),
        insuranceService.getGlobalProviders({ pageSize: '100' }),
      ]);
      setProviders(cp);
      setGlobalProviders(gp.items);
    } catch { } finally { setLoading(false); }
  }

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleActivate() {
    if (!addForm.insuranceProviderId) return;
    setSaving(true);
    try {
      await insuranceService.activateProvider(addForm);
      await load();
      setShowAddModal(false);
      setAddForm({ insuranceProviderId: '', preAuthRequired: false, defaultCoveragePercent: 80, notes: '' });
      showToast('تم تفعيل شركة التأمين بنجاح', 'success');
    } catch { showToast('حدث خطأ', 'error'); } finally { setSaving(false); }
  }

  async function handleUpdate() {
    if (!selected) return;
    setSaving(true);
    try {
      await insuranceService.updateProvider(selected.id, editForm);
      await load();
      setShowEditModal(false);
      showToast('تم التحديث بنجاح', 'success');
    } catch { showToast('حدث خطأ', 'error'); } finally { setSaving(false); }
  }

  async function handleDeactivate(id: string) {
    if (!confirm('هل تريد إلغاء تفعيل هذه الشركة؟')) return;
    try {
      await insuranceService.deactivateProvider(id);
      await load();
      showToast('تم إلغاء التفعيل', 'success');
    } catch { showToast('حدث خطأ', 'error'); }
  }

  const filteredGlobal = globalProviders.filter(p =>
    !providers.some(cp => cp.insuranceProviderId === p.id) &&
    (p.name.toLowerCase().includes(searchGlobal.toLowerCase()) || (p.country ?? '').toLowerCase().includes(searchGlobal.toLowerCase()))
  );

  const statusColors: Record<string, string> = {
    true: 'bg-green-100 text-green-700',
    false: 'bg-gray-100 text-gray-500',
  };

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
          <h1 className="text-xl font-bold text-gray-800">إعدادات التأمين</h1>
          <p className="text-sm text-gray-500 mt-1">إدارة شركات التأمين المقبولة في العيادة</p>
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#29AAFE] text-white rounded-lg text-sm font-medium hover:bg-[#1a9aee] transition-colors">
          + إضافة شركة تأمين
        </button>
      </div>

      {/* Active providers */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <span className="text-sm font-semibold text-gray-700">شركات التأمين المفعّلة ({providers.length})</span>
        </div>
        {providers.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">🏥</div>
            <p className="text-gray-500 text-sm">لا توجد شركات تأمين مفعّلة</p>
            <button onClick={() => setShowAddModal(true)} className="mt-3 text-[#29AAFE] text-sm underline">أضف الآن</button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {providers.map(p => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-lg font-bold text-[#29AAFE]">
                    {p.providerName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{p.providerName}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                      <span>تغطية: {p.defaultCoveragePercent}%</span>
                      {p.country && <span>• {p.country}</span>}
                      {p.preAuthRequired && <span className="text-orange-500">• يتطلب موافقة مسبقة</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[String(p.isActive)]}`}>
                    {p.isActive ? 'مفعّل' : 'غير مفعّل'}
                  </span>
                  <button onClick={() => { setSelected(p); setEditForm({ preAuthRequired: p.preAuthRequired, defaultCoveragePercent: p.defaultCoveragePercent, notes: p.notes ?? '' }); setShowEditModal(true); }}
                    className="text-xs text-gray-500 hover:text-[#29AAFE] px-2 py-1 rounded hover:bg-gray-50">
                    تعديل
                  </button>
                  <button onClick={() => handleDeactivate(p.id)}
                    className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50">
                    إلغاء
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">تفعيل شركة تأمين</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">بحث عن شركة تأمين</label>
                <input value={searchGlobal} onChange={e => setSearchGlobal(e.target.value)}
                  placeholder="اكتب اسم الشركة أو الدولة..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#29AAFE]" />
              </div>
              <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-50">
                {filteredGlobal.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-4">لا توجد نتائج</p>
                ) : filteredGlobal.map(p => (
                  <button key={p.id} onClick={() => setAddForm(f => ({ ...f, insuranceProviderId: p.id }))}
                    className={`w-full text-right px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${addForm.insuranceProviderId === p.id ? 'bg-blue-50 text-[#29AAFE] font-medium' : 'text-gray-700'}`}>
                    {p.name} {p.country ? `(${p.country})` : ''}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">نسبة التغطية الافتراضية (%)</label>
                <input type="number" min={0} max={100} value={addForm.defaultCoveragePercent}
                  onChange={e => setAddForm(f => ({ ...f, defaultCoveragePercent: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#29AAFE]" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={addForm.preAuthRequired} onChange={e => setAddForm(f => ({ ...f, preAuthRequired: e.target.checked }))} className="rounded" />
                <span className="text-sm text-gray-700">يتطلب موافقة مسبقة</span>
              </label>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">ملاحظات (اختياري)</label>
                <textarea value={addForm.notes} onChange={e => setAddForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#29AAFE] resize-none" />
              </div>
            </div>
            <div className="px-5 pb-4 flex gap-2 justify-end">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">إلغاء</button>
              <button onClick={handleActivate} disabled={saving || !addForm.insuranceProviderId}
                className="px-4 py-2 bg-[#29AAFE] text-white rounded-lg text-sm font-medium hover:bg-[#1a9aee] disabled:opacity-50">
                {saving ? 'جاري الحفظ...' : 'تفعيل'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {showEditModal && selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">تعديل — {selected.providerName}</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">نسبة التغطية الافتراضية (%)</label>
                <input type="number" min={0} max={100} value={editForm.defaultCoveragePercent}
                  onChange={e => setEditForm(f => ({ ...f, defaultCoveragePercent: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#29AAFE]" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editForm.preAuthRequired} onChange={e => setEditForm(f => ({ ...f, preAuthRequired: e.target.checked }))} className="rounded" />
                <span className="text-sm text-gray-700">يتطلب موافقة مسبقة</span>
              </label>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">ملاحظات</label>
                <textarea value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#29AAFE] resize-none" />
              </div>
            </div>
            <div className="px-5 pb-4 flex gap-2 justify-end">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">إلغاء</button>
              <button onClick={handleUpdate} disabled={saving}
                className="px-4 py-2 bg-[#29AAFE] text-white rounded-lg text-sm font-medium hover:bg-[#1a9aee] disabled:opacity-50">
                {saving ? 'جاري الحفظ...' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
