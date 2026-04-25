'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Locale } from '@/configs/i18n.config';
import { Button } from '@/ui/primitives';
import { specialityService, diagnosisService } from '@/domains/clinical';
import type {
  DiagnosisListItem,
  DiagnosisDto,
  SpecialityDto,
  CreateDiagnosisRequest,
  DiagnosisQueryParams,
} from '@/domains/clinical';

// ─── Drawer ───────────────────────────────────────────────────────────────────

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editing: DiagnosisDto | null;
  specialities: SpecialityDto[];
}

function DiagnosisDrawer({ isOpen, onClose, onSaved, editing, specialities }: DrawerProps) {
  const [form, setForm] = useState<CreateDiagnosisRequest>({
    icdCode: '',
    nameEn: '',
    nameAr: '',
    specialityId: '',
    defaultProtocolName: '',
    suggestedSessions: undefined,
    suggestedDurationWeeks: undefined,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editing) {
      setForm({
        icdCode: editing.icdCode || '',
        nameEn: editing.nameEn || '',
        nameAr: editing.nameAr || '',
        specialityId: editing.specialityId || '',
        defaultProtocolName: (editing as DiagnosisDto).defaultProtocolName || '',
        suggestedSessions: (editing as DiagnosisDto).suggestedSessions,
        suggestedDurationWeeks: (editing as DiagnosisDto).suggestedDurationWeeks,
      });
    } else {
      setForm({
        icdCode: '', nameEn: '', nameAr: '', specialityId: '',
        defaultProtocolName: '', suggestedSessions: undefined, suggestedDurationWeeks: undefined,
      });
    }
    setError(null);
  }, [editing, isOpen]);

  const handleSave = async () => {
    if (!form.nameAr?.trim() || !form.nameEn?.trim()) {
      setError('الاسم العربي والإنجليزي مطلوبان');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await diagnosisService.update(editing.id, {
          nameEn: form.nameEn,
          nameAr: form.nameAr,
          specialityId: form.specialityId || undefined,
          defaultProtocolName: form.defaultProtocolName || undefined,
          suggestedSessions: form.suggestedSessions,
          suggestedDurationWeeks: form.suggestedDurationWeeks,
        });
      } else {
        await diagnosisService.create(form);
      }
      onSaved();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-full max-w-md bg-white shadow-xl flex flex-col" dir="rtl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            {editing ? 'تعديل التشخيص' : 'إضافة تشخيص عالمي'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* ICD code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كود ICD-10</label>
            <input
              type="text"
              dir="ltr"
              value={form.icdCode}
              onChange={e => setForm(f => ({ ...f, icdCode: e.target.value.toUpperCase() }))}
              placeholder="e.g. M54.5"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-Primary-400 focus:ring-1 focus:ring-Primary-100"
            />
          </div>

          {/* Arabic name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم بالعربي *</label>
            <input
              type="text"
              value={form.nameAr}
              onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))}
              placeholder="مثال: ألم أسفل الظهر"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-Primary-400 focus:ring-1 focus:ring-Primary-100"
            />
          </div>

          {/* English name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم بالإنجليزي *</label>
            <input
              type="text"
              dir="ltr"
              value={form.nameEn}
              onChange={e => setForm(f => ({ ...f, nameEn: e.target.value }))}
              placeholder="e.g. Low back pain"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-Primary-400 focus:ring-1 focus:ring-Primary-100"
            />
          </div>

          {/* Speciality */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">التخصص</label>
            <select
              value={form.specialityId}
              onChange={e => setForm(f => ({ ...f, specialityId: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-Primary-400 bg-white"
            >
              <option value="">— اختر التخصص —</option>
              {specialities.map(s => (
                <option key={s.id} value={s.id}>{s.nameAr} ({s.code})</option>
              ))}
            </select>
          </div>

          {/* Default protocol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">بروتوكول علاج افتراضي</label>
            <input
              type="text"
              value={form.defaultProtocolName}
              onChange={e => setForm(f => ({ ...f, defaultProtocolName: e.target.value }))}
              placeholder="مثال: بروتوكول ألم الظهر المزمن"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-Primary-400 focus:ring-1 focus:ring-Primary-100"
            />
          </div>

          {/* Sessions / duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">عدد الجلسات المقترح</label>
              <input
                type="number"
                min={1}
                value={form.suggestedSessions ?? ''}
                onChange={e => setForm(f => ({ ...f, suggestedSessions: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-Primary-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">مدة العلاج (أسابيع)</label>
              <input
                type="number"
                min={1}
                value={form.suggestedDurationWeeks ?? ''}
                onChange={e => setForm(f => ({ ...f, suggestedDurationWeeks: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-Primary-400"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100">
          <Button fullWidth isLoading={saving} onClick={handleSave}>
            {editing ? 'حفظ التعديلات' : 'إضافة التشخيص'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DiagnosesPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as Locale;

  const [diagnoses, setDiagnoses] = useState<DiagnosisListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [specialities, setSpecialities] = useState<SpecialityDto[]>([]);
  const [filterSpeciality, setFilterSpeciality] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<DiagnosisDto | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<DiagnosisListItem | null>(null);

  const loadSpecialities = useCallback(async () => {
    try {
      const data = await specialityService.getAll(true);
      setSpecialities(data);
    } catch { /* silent */ }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q: DiagnosisQueryParams = {
        page,
        pageSize,
        specialityId: filterSpeciality || undefined,
        search: search || undefined,
      };
      const result = await diagnosisService.getAll(q);
      setDiagnoses(result.items);
      setTotal(result.totalCount);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filterSpeciality, search]);

  useEffect(() => { loadSpecialities(); }, [loadSpecialities]);
  useEffect(() => { load(); }, [load]);

  const handleSearch = () => { setSearch(searchInput); setPage(1); };
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSearch(); };

  const handleSeedIcd10 = async () => {
    setSeeding(true);
    setSeedMsg(null);
    try {
      const count = await diagnosisService.seedIcd10();
      await load();
      setSeedMsg(`تمت إضافة ${count} تشخيص بنجاح`);
      setTimeout(() => setSeedMsg(null), 5000);
    } catch {
      setSeedMsg('حدث خطأ أثناء الإضافة');
      setTimeout(() => setSeedMsg(null), 4000);
    } finally {
      setSeeding(false);
    }
  };

  const handleDelete = async (d: DiagnosisListItem) => {
    setDeleting(d.id);
    try {
      await diagnosisService.delete(d.id);
      await load();
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  };

  const openEdit = async (d: DiagnosisListItem) => {
    try {
      const full = await diagnosisService.getById(d.id);
      setEditing(full);
    } catch {
      setEditing(d as DiagnosisDto);
    }
    setDrawerOpen(true);
  };

  const handleSaved = () => { setDrawerOpen(false); setEditing(null); load(); };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Back */}
      <button
        onClick={() => router.push(`/${locale}/settings`)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors w-fit"
      >
        <img src="/shered/arrwo.svg" alt="back" width={12} height={12} className="rotate-180" />
        <span className="text-sm font-medium">الرجوع للإعدادات</span>
      </button>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900">قائمة التشخيصات ICD-10</h1>
            <p className="text-sm text-gray-500 mt-1">
              التشخيصات العالمية المنسقة حسب التخصص ({total} إجمالي)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSeedIcd10}
              disabled={seeding}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 text-sm font-medium hover:bg-purple-100 transition-colors disabled:opacity-60"
            >
              {seeding ? (
                <span className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>✦</span>
              )}
              إضافة قائمة ICD-10
            </button>
            <Button
              variant="primary"
              startIcon={<span className="text-lg font-bold">+</span>}
              onClick={() => { setEditing(null); setDrawerOpen(true); }}
            >
              إضافة تشخيص
            </Button>
          </div>
        </div>

        {seedMsg && (
          <div className={`mt-3 text-sm px-4 py-2 rounded-lg ${seedMsg.includes('خطأ') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
            {seedMsg}
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 mt-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="بحث بالاسم أو كود ICD..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm pr-10 outline-none focus:border-Primary-400 focus:ring-1 focus:ring-Primary-100"
            />
            <button
              onClick={handleSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-Primary-600"
            >
              🔍
            </button>
          </div>
          <select
            value={filterSpeciality}
            onChange={e => { setFilterSpeciality(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-Primary-400 bg-white"
          >
            <option value="">كل التخصصات</option>
            {specialities.map(s => (
              <option key={s.id} value={s.id}>{s.nameAr}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="w-6 h-6 border-2 border-Primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : diagnoses.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🩺</div>
            <p className="font-medium">لا توجد تشخيصات</p>
            <p className="text-sm mt-1">أضف قائمة ICD-10 أو أنشئ تشخيصاً يدوياً</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">كود ICD</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">الاسم بالعربي</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">الاسم بالإنجليزي</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">التخصص</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">النوع</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {diagnoses.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <span className="inline-block bg-blue-50 text-blue-700 text-xs font-mono font-bold px-2 py-1 rounded-md">
                        {d.icdCode || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{d.nameAr}</td>
                    <td className="px-4 py-3 text-sm text-gray-600" dir="ltr">{d.nameEn}</td>
                    <td className="px-4 py-3">
                      {d.specialityNameAr ? (
                        <span className="inline-block bg-Primary-50 text-Primary-700 text-xs font-medium px-2 py-1 rounded-md">
                          {d.specialityNameAr}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                        d.isGlobal
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-orange-50 text-orange-700'
                      }`}>
                        {d.isGlobal ? '🌐 عالمي' : '🏥 مخصص'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(d)}
                          className="text-xs text-Primary-600 hover:text-Primary-800 font-medium px-2.5 py-1 rounded-md hover:bg-Primary-50 transition-colors"
                        >
                          تعديل
                        </button>
                        {confirmDelete?.id === d.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(d)}
                              disabled={deleting === d.id}
                              className="text-xs text-white bg-red-500 hover:bg-red-600 font-medium px-2.5 py-1 rounded-md transition-colors disabled:opacity-60"
                            >
                              {deleting === d.id ? '...' : 'تأكيد'}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(d)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium px-2.5 py-1 rounded-md hover:bg-red-50 transition-colors"
                          >
                            حذف
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  عرض {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} من {total}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    السابق
                  </button>
                  <span className="px-3 py-1.5 text-xs text-gray-700 font-medium">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    التالي
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Drawer */}
      <DiagnosisDrawer
        isOpen={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditing(null); }}
        onSaved={handleSaved}
        editing={editing}
        specialities={specialities}
      />
    </div>
  );
}
