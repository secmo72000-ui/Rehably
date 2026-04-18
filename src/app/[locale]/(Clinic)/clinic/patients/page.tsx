'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { patientsService } from '@/domains/patients/patients.service';
import type { PatientListItem } from '@/domains/patients/patients.types';

const statusMap: Record<string, { label: string; cls: string }> = {
  Active:     { label: 'نشط',    cls: 'bg-green-50 text-green-600' },
  Inactive:   { label: 'غير نشط', cls: 'bg-yellow-50 text-yellow-600' },
  Discharged: { label: 'خُرِّج', cls: 'bg-gray-100 text-gray-500' },
};

// ── Add Patient Drawer ─────────────────────────────────────
function AddPatientDrawer({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', email: '',
    diagnosis: '', gender: 0, dob: '', notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form, v: string | number) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    if (!form.firstName || !form.lastName) {
      setError('الاسم الأول والأخير مطلوبان');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await patientsService.create({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
        email: form.email || undefined,
        dateOfBirth: form.dob || undefined,
        gender: form.gender,
        diagnosis: form.diagnosis || undefined,
        notes: form.notes || undefined,
      });
      onSaved();
      onClose();
    } catch {
      setError('فشل في حفظ المريض. حاول مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-end" dir="rtl" onClick={onClose}>
      <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <span className="text-base font-black text-gray-800">إضافة مريض جديد</span>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-xs rounded-xl px-3 py-2">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <Field label="الاسم الأول *" value={form.firstName} onChange={v => set('firstName', v)} />
            <Field label="الاسم الأخير *" value={form.lastName} onChange={v => set('lastName', v)} />
          </div>
          <Field label="رقم الهاتف" value={form.phone} onChange={v => set('phone', v)} type="tel" />
          <Field label="البريد الإلكتروني" value={form.email} onChange={v => set('email', v)} type="email" />
          <Field label="تاريخ الميلاد" value={form.dob} onChange={v => set('dob', v)} type="date" />
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">الجنس</label>
            <div className="flex gap-3">
              {[['ذكر', 0], ['أنثى', 1]].map(([label, val]) => (
                <button key={val} type="button" onClick={() => set('gender', val as number)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors ${form.gender === val ? 'bg-[#29AAFE] text-white border-[#29AAFE]' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <Field label="التشخيص" value={form.diagnosis} onChange={v => set('diagnosis', v)} />
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">ملاحظات</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#29AAFE] resize-none" />
          </div>
        </div>
        <div className="p-5 border-t border-gray-100">
          <button onClick={handleSave} disabled={saving}
            className="w-full bg-[#29AAFE] hover:bg-[#1A8FD9] disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-colors">
            {saving ? 'جاري الحفظ...' : 'حفظ المريض'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#29AAFE]" dir="rtl" />
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────
export default function PatientsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';

  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showDrawer, setShowDrawer] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'Active' | 'Inactive' | 'Discharged'>('all');
  const [page, setPage] = useState(1);
  const perPage = 20;

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const statusEnumMap: Record<string, number | undefined> = {
        all: undefined, Active: 0, Inactive: 1, Discharged: 2,
      };
      const result = await patientsService.getAll({
        page,
        pageSize: perPage,
        search: search || undefined,
        status: statusEnumMap[filter],
      });
      setPatients(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch {
      setError('فشل في تحميل المرضى');
    } finally {
      setLoading(false);
    }
  }, [page, search, filter]);

  useEffect(() => { loadPatients(); }, [loadPatients]);

  // Debounce search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-gray-800">المرضى {!loading && <span className="text-sm font-normal text-gray-400">({totalCount})</span>}</h1>
        <button onClick={() => setShowDrawer(true)} className="flex items-center gap-1.5 bg-[#29AAFE] hover:bg-[#1A8FD9] text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors">
          <span>+</span> إضافة مريض
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 flex-1 min-w-[180px] max-w-xs">
          <svg className="text-gray-400 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="بحث..." className="bg-transparent border-none outline-none text-sm w-full text-right" dir="rtl" />
        </div>
        <div className="flex gap-1.5">
          {([['all','الكل'], ['Active','نشط'], ['Inactive','غير نشط'], ['Discharged','خُرِّج']] as const).map(([val, lbl]) => (
            <button key={val} onClick={() => { setFilter(val); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === val ? 'bg-[#29AAFE] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" dir="rtl">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['الاسم', 'رقم الهاتف', 'التشخيص', 'المواعيد', 'خطط العلاج', 'الحالة', 'تفاصيل'].map(h => (
                  <th key={h} className="px-4 py-3 text-right text-xs font-bold text-gray-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">جاري التحميل...</td></tr>
              ) : patients.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">لا يوجد مرضى</td></tr>
              ) : patients.map(p => {
                const s = statusMap[p.status] ?? { label: p.status, cls: 'bg-gray-100 text-gray-500' };
                return (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-gray-800 whitespace-nowrap">{p.firstName} {p.lastName}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap font-mono text-xs">{p.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">{p.diagnosis ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs text-center">{p.appointmentsCount}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs text-center">{p.activeTreatmentPlansCount}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.cls}`}>{s.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/${locale}/clinic/patients/${p.id}`} className="text-[#29AAFE] text-xs font-bold hover:underline whitespace-nowrap">
                        عرض الملف
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-100">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition-colors">السابق</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${page === n ? 'bg-[#29AAFE] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{n}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition-colors">التالي</button>
          </div>
        )}
      </div>

      {showDrawer && <AddPatientDrawer onClose={() => setShowDrawer(false)} onSaved={loadPatients} />}
    </div>
  );
}
