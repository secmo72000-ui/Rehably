'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { treatmentPlansService } from '@/domains/treatment-plans/treatment-plans.service';
import { patientsService } from '@/domains/patients/patients.service';
import type { TreatmentPlanItem } from '@/domains/treatment-plans/treatment-plans.types';
import type { PatientListItem } from '@/domains/patients/patients.types';
import { getApiError } from '@/shared/utils';

type FilterStatus = 'all' | 'Draft' | 'Active' | 'Completed' | 'Cancelled';

const statusMap: Record<string, { label: string; cls: string }> = {
  Draft:     { label: 'مسودة',   cls: 'bg-gray-100 text-gray-500' },
  Active:    { label: 'نشطة',    cls: 'bg-green-50 text-green-600' },
  Completed: { label: 'مكتملة', cls: 'bg-[#E8F5FF] text-[#29AAFE]' },
  Cancelled: { label: 'ملغاة',  cls: 'bg-red-50 text-red-500' },
};

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-[#29AAFE] rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-gray-600 whitespace-nowrap">{done}/{total}</span>
    </div>
  );
}

// ── Add Plan Modal ─────────────────────────────────────────
function AddPlanModal({ onClose, onSaved, patients }: {
  onClose: () => void;
  onSaved: () => void;
  patients: PatientListItem[];
}) {
  const [form, setForm] = useState({
    patientId: '', title: '', diagnosis: '', startDate: '',
    totalSessionsPlanned: 10, goals: '', notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!form.patientId || !form.title || !form.startDate) {
      setError('يرجى ملء الحقول المطلوبة');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await treatmentPlansService.create({
        patientId: form.patientId,
        title: form.title,
        diagnosis: form.diagnosis || undefined,
        startDate: new Date(form.startDate).toISOString(),
        totalSessionsPlanned: form.totalSessionsPlanned,
        goals: form.goals || undefined,
        notes: form.notes || undefined,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(getApiError(err, 'فشل في إنشاء خطة العلاج'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-end" dir="rtl" onClick={onClose}>
      <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <span className="text-base font-black text-gray-800">إضافة خطة علاج جديدة</span>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-xs rounded-xl px-3 py-2">{error}</div>}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">المريض *</label>
            <select value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#29AAFE] bg-white">
              <option value="">اختر المريض</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">عنوان الخطة *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#29AAFE]" dir="rtl" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">التشخيص</label>
            <input value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#29AAFE]" dir="rtl" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">تاريخ البدء *</label>
            <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#29AAFE]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">عدد الجلسات المخططة</label>
            <input type="number" min={1} value={form.totalSessionsPlanned}
              onChange={e => setForm(f => ({ ...f, totalSessionsPlanned: Number(e.target.value) }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#29AAFE]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">الأهداف</label>
            <textarea value={form.goals} onChange={e => setForm(f => ({ ...f, goals: e.target.value }))} rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#29AAFE] resize-none" />
          </div>
        </div>
        <div className="p-5 border-t border-gray-100">
          <button onClick={handleSave} disabled={saving}
            className="w-full bg-[#29AAFE] hover:bg-[#1A8FD9] disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-colors">
            {saving ? 'جاري الحفظ...' : 'إنشاء خطة العلاج'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────
export default function TreatmentPlansPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';

  const [plans, setPlans] = useState<TreatmentPlanItem[]>([]);
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const statusEnumMap: Record<string, number | undefined> = {
        all: undefined, Draft: 0, Active: 1, Completed: 2, Cancelled: 3,
      };
      const result = await treatmentPlansService.getAll({
        page,
        pageSize: 20,
        search: search || undefined,
        status: statusEnumMap[filter],
      });
      setPlans(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(getApiError(err, 'فشل في تحميل خطط العلاج'));
    } finally {
      setLoading(false);
    }
  }, [page, search, filter]);

  const loadPatients = useCallback(async () => {
    try {
      const result = await patientsService.getAll({ page: 1, pageSize: 100 });
      setPatients(result.items);
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => { loadPlans(); }, [loadPlans]);
  useEffect(() => { loadPatients(); }, [loadPatients]);

  const handleActivate = async (id: string) => {
    try {
      await treatmentPlansService.activate(id);
      loadPlans();
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-gray-800">خطط العلاج {!loading && <span className="text-sm font-normal text-gray-400">({totalCount})</span>}</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 bg-[#29AAFE] hover:bg-[#1A8FD9] text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors">
          <span>+</span> إضافة خطة علاج
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
        <div className="flex gap-1.5 flex-wrap">
          {([['all','الكل'], ['Active','نشطة'], ['Draft','مسودة'], ['Completed','مكتملة'], ['Cancelled','ملغاة']] as const).map(([val, lbl]) => (
            <button key={val} onClick={() => { setFilter(val); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === val ? 'bg-[#29AAFE] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}

      {/* Cards grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">جاري التحميل...</div>
      ) : plans.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm flex flex-col items-center gap-3 text-gray-400">
          <span className="text-5xl">📋</span>
          <span className="text-sm font-semibold">لا توجد خطط علاج</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {plans.map(plan => {
            const s = statusMap[plan.status] ?? { label: plan.status, cls: 'bg-gray-100 text-gray-500' };
            return (
              <div key={plan.id} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border border-transparent hover:border-[#29AAFE]/30">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 ml-2">
                    <h3 className="font-black text-gray-800 text-sm leading-tight">{plan.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">👤 {plan.patientName}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${s.cls}`}>{s.label}</span>
                </div>

                <div className="space-y-1.5 text-xs text-gray-500 mb-3">
                  {plan.therapistName && <div className="flex items-center gap-2"><span>👨‍⚕️</span><span>{plan.therapistName}</span></div>}
                  {plan.diagnosis && <div className="flex items-center gap-2"><span>🩺</span><span>{plan.diagnosis}</span></div>}
                  <div className="flex items-center gap-2">
                    <span>📅</span><span>بدأت: {new Date(plan.startDate).toLocaleDateString('ar')}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400 font-semibold">تقدم الجلسات</span>
                    <span className="text-xs font-bold text-gray-600">
                      {plan.totalSessionsPlanned > 0 ? Math.round((plan.completedSessions / plan.totalSessionsPlanned) * 100) : 0}%
                    </span>
                  </div>
                  <ProgressBar done={plan.completedSessions} total={plan.totalSessionsPlanned} />
                </div>

                <div className="flex gap-2">
                  <Link href={`/${locale}/clinic/treatment-plans/${plan.id}`}
                    className="flex-1 text-center bg-[#E8F5FF] text-[#29AAFE] text-xs font-bold py-2 rounded-xl hover:bg-[#29AAFE] hover:text-white transition-colors">
                    عرض التفاصيل
                  </Link>
                  {plan.status === 'Draft' && (
                    <button onClick={() => handleActivate(plan.id)}
                      className="flex-1 text-center bg-green-50 text-green-600 text-xs font-bold py-2 rounded-xl hover:bg-green-500 hover:text-white transition-colors">
                      تفعيل
                    </button>
                  )}
                  {plan.status === 'Active' && (
                    <Link href={`/${locale}/clinic/treatment-plans/${plan.id}`}
                      className="flex-1 text-center bg-[#29AAFE] text-white text-xs font-bold py-2 rounded-xl hover:bg-[#1A8FD9] transition-colors">
                      إضافة جلسة
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40">السابق</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => setPage(n)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${page === n ? 'bg-[#29AAFE] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{n}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40">التالي</button>
        </div>
      )}

      {showModal && <AddPlanModal onClose={() => setShowModal(false)} onSaved={loadPlans} patients={patients} />}
    </div>
  );
}
