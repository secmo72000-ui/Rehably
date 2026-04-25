'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/services/api-client';
import { getApiError } from '@/shared/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClinicSpeciality {
  specialityId: string;
  nameAr: string;
  code: string;
}

interface DiagnosisItem {
  id: string;
  icdCode: string;
  nameAr: string;
  nameEn: string;
  specialityNameAr: string;
  bodyRegionNameAr?: string;
  isGlobal: boolean;
  isActive: boolean;
}

interface CreateDiagnosisForm {
  specialityId: string;
  icdCode: string;
  nameAr: string;
  nameEn: string;
  suggestedSessions: string;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function fetchSpecialities(): Promise<ClinicSpeciality[]> {
  const r = await apiClient.get<{ data: ClinicSpeciality[] }>('/api/clinic/diagnoses/specialities');
  return r.data.data;
}

async function fetchDiagnoses(params: {
  specialityId?: string; search?: string;
}): Promise<DiagnosisItem[]> {
  const r = await apiClient.get<{ data: DiagnosisItem[] }>('/api/clinic/diagnoses', { params });
  return r.data.data;
}

async function createCustomDiagnosis(body: {
  specialityId: string; icdCode?: string; nameAr: string; nameEn: string;
  suggestedSessions?: number;
}): Promise<DiagnosisItem> {
  const r = await apiClient.post<{ data: DiagnosisItem }>('/api/clinic/diagnoses', body);
  return r.data.data;
}

// ─── Add Diagnosis Drawer ─────────────────────────────────────────────────────

function AddDiagnosisDrawer({
  specialities,
  onClose,
  onSaved,
}: {
  specialities: ClinicSpeciality[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<CreateDiagnosisForm>({
    specialityId: specialities[0]?.specialityId ?? '',
    icdCode: '',
    nameAr: '',
    nameEn: '',
    suggestedSessions: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!form.specialityId || !form.nameAr || !form.nameEn) {
      setError('يرجى ملء الاسم العربي والإنجليزي والتخصص'); return;
    }
    setSaving(true); setError(null);
    try {
      await createCustomDiagnosis({
        specialityId: form.specialityId,
        icdCode: form.icdCode || undefined,
        nameAr: form.nameAr,
        nameEn: form.nameEn,
        suggestedSessions: form.suggestedSessions ? Number(form.suggestedSessions) : undefined,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(getApiError(err, 'فشل في إضافة التشخيص'));
    } finally {
      setSaving(false);
    }
  };

  const inp = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#29AAFE] focus:ring-2 focus:ring-[#29AAFE]/10';

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-end" dir="rtl" onClick={onClose}>
      <div className="w-full max-w-sm h-full bg-white shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <div>
            <div className="text-base font-black text-gray-800">إضافة تشخيص مخصص</div>
            <div className="text-xs text-gray-400 mt-0.5">تشخيص خاص بالعيادة</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-xs rounded-xl px-3 py-2">{error}</div>}

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">التخصص *</label>
            <select
              value={form.specialityId}
              onChange={e => setForm(f => ({ ...f, specialityId: e.target.value }))}
              className={`${inp} bg-white`}
            >
              <option value="">اختر التخصص</option>
              {specialities.map(s => (
                <option key={s.specialityId} value={s.specialityId}>{s.nameAr}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">الاسم بالعربية *</label>
            <input
              value={form.nameAr}
              onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))}
              placeholder="مثال: التهاب الوتر الرباعي الرؤوس"
              className={inp}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">الاسم بالإنجليزية *</label>
            <input
              value={form.nameEn}
              onChange={e => setForm(f => ({ ...f, nameEn: e.target.value }))}
              placeholder="e.g. Quadriceps Tendinitis"
              className={inp}
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">كود ICD (اختياري)</label>
            <input
              value={form.icdCode}
              onChange={e => setForm(f => ({ ...f, icdCode: e.target.value.toUpperCase() }))}
              placeholder="M76.5"
              className={inp}
              dir="ltr"
              maxLength={20}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">عدد الجلسات المقترحة (اختياري)</label>
            <input
              type="number"
              min="1"
              max="100"
              value={form.suggestedSessions}
              onChange={e => setForm(f => ({ ...f, suggestedSessions: e.target.value }))}
              placeholder="12"
              className={inp}
              dir="ltr"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 p-5 border-t border-gray-100 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50">
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-[#29AAFE] hover:bg-[#1A8FD9] disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
          >
            {saving ? 'جاري الحفظ…' : 'حفظ التشخيص'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 5000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg text-sm font-bold text-white ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`} dir="rtl">
      {type === 'success' ? '✓' : '✕'} {message}
      <button onClick={onClose} className="opacity-70 hover:opacity-100 mr-1 text-xs">✕</button>
    </div>
  );
}

export default function ClinicDiagnosesPage() {
  const [specialities, setSpecialities] = useState<ClinicSpeciality[]>([]);
  const [diagnoses, setDiagnoses] = useState<DiagnosisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterSpeciality, setFilterSpeciality] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await fetchDiagnoses({
        specialityId: filterSpeciality || undefined,
        search: search || undefined,
      });
      setDiagnoses(data);
    } catch (err) {
      setError(getApiError(err, 'فشل في تحميل التشخيصات'));
    } finally {
      setLoading(false);
    }
  }, [search, filterSpeciality]);

  useEffect(() => {
    fetchSpecialities().then(setSpecialities).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-800">التشخيصات</h1>
          <p className="text-xs text-gray-400 mt-0.5">التشخيصات المتاحة للعيادة + المخصصة</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 bg-[#29AAFE] hover:bg-[#1A8FD9] text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
        >
          + إضافة تشخيص مخصص
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex gap-3 flex-wrap">
        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو كود ICD…"
            className="w-full border border-gray-200 rounded-xl pr-9 pl-3 py-2 text-sm outline-none focus:border-[#29AAFE] focus:ring-2 focus:ring-[#29AAFE]/10"
          />
        </div>

        {/* Speciality filter */}
        <select
          value={filterSpeciality}
          onChange={e => setFilterSpeciality(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#29AAFE] bg-white min-w-[160px]"
        >
          <option value="">جميع التخصصات</option>
          {specialities.map(s => (
            <option key={s.specialityId} value={s.specialityId}>{s.nameAr}</option>
          ))}
        </select>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          {loading ? 'جاري التحميل…' : `${diagnoses.length} نتيجة`}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3">{error}</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['كود ICD', 'الاسم بالعربية', 'الاسم بالإنجليزية', 'التخصص', 'المنطقة', 'النوع', 'الحالة'].map(h => (
                  <th key={h} className="px-4 py-3 text-right text-xs font-bold text-gray-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">جاري التحميل…</td></tr>
              ) : diagnoses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="text-gray-300 text-4xl mb-2">🩺</div>
                    <div className="text-gray-400 text-sm">لا توجد تشخيصات</div>
                    <div className="text-gray-300 text-xs mt-1">
                      {search || filterSpeciality ? 'حاول تغيير فلتر البحث' : 'أضف تشخيصاً مخصصاً أو تأكد من تعيين تخصصات للعيادة'}
                    </div>
                  </td>
                </tr>
              ) : diagnoses.map(d => (
                <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg">{d.icdCode}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800 text-sm">{d.nameAr}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs" dir="ltr">{d.nameEn}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-lg">{d.specialityNameAr}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{d.bodyRegionNameAr ?? '—'}</td>
                  <td className="px-4 py-3">
                    {d.isGlobal ? (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">عالمي ICD</span>
                    ) : (
                      <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">مخصص</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                      d.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${d.isActive ? 'bg-green-500' : 'bg-red-400'}`} />
                      {d.isActive ? 'فعّال' : 'معطّل'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <AddDiagnosisDrawer
          specialities={specialities}
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            load();
            setToast({ message: 'تم إضافة التشخيص بنجاح', type: 'success' });
          }}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
