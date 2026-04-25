'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Locale } from '@/configs/i18n.config';
import { Button } from '@/ui/primitives';
import { specialityService } from '@/domains/clinical';
import type { SpecialityDto, CreateSpecialityRequest } from '@/domains/clinical';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CHAPTER_LABELS: Record<string, string> = {
  M: 'M - الجهاز العضلي الهيكلي',
  G: 'G - الجهاز العصبي',
  S: 'S - الإصابات والحوادث',
  Q: 'Q - الأمراض الخلقية',
  I: 'I - الجهاز الدوري',
  J: 'J - الجهاز التنفسي',
  N: 'N - الجهاز البولي التناسلي',
  O: 'O - الحمل والولادة',
  C: 'C - الأورام',
};

// ─── Drawer Form ──────────────────────────────────────────────────────────────

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editing: SpecialityDto | null;
}

function SpecialityDrawer({ isOpen, onClose, onSaved, editing }: DrawerProps) {
  const [form, setForm] = useState<CreateSpecialityRequest>({
    code: '',
    nameEn: '',
    nameAr: '',
    icdChapters: '',
    displayOrder: 1,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editing) {
      setForm({
        code: editing.code,
        nameEn: editing.nameEn,
        nameAr: editing.nameAr,
        icdChapters: editing.icdChapters,
        displayOrder: editing.displayOrder,
        isActive: editing.isActive,
      });
    } else {
      setForm({ code: '', nameEn: '', nameAr: '', icdChapters: '', displayOrder: 1, isActive: true });
    }
    setError(null);
  }, [editing, isOpen]);

  const toggle = (ch: string) => {
    const current = form.icdChapters ? form.icdChapters.split(',').map(s => s.trim()).filter(Boolean) : [];
    const next = current.includes(ch) ? current.filter(c => c !== ch) : [...current, ch];
    setForm(f => ({ ...f, icdChapters: next.join(',') }));
  };

  const selectedChapters = form.icdChapters ? form.icdChapters.split(',').map(s => s.trim()).filter(Boolean) : [];

  const handleSave = async () => {
    if (!form.nameAr.trim() || !form.nameEn.trim()) {
      setError('الاسم العربي والإنجليزي مطلوبان');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await specialityService.update(editing.id, {
          nameEn: form.nameEn,
          nameAr: form.nameAr,
          icdChapters: form.icdChapters,
          displayOrder: form.displayOrder,
          isActive: form.isActive,
        });
      } else {
        await specialityService.create(form);
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
      {/* Backdrop */}
      <div className="flex-1 bg-black/30" onClick={onClose} />
      {/* Panel */}
      <div className="w-full max-w-md bg-white shadow-xl flex flex-col" dir="rtl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            {editing ? 'تعديل التخصص' : 'إضافة تخصص'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Code (create only) */}
          {!editing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كود التخصص *</label>
              <input
                type="text"
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="مثال: ORTHO"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-Primary-400 focus:ring-1 focus:ring-Primary-100"
              />
            </div>
          )}

          {/* Arabic name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم بالعربي *</label>
            <input
              type="text"
              value={form.nameAr}
              onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))}
              placeholder="مثال: العظام والمفاصل"
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
              placeholder="e.g. Orthopaedics & Musculoskeletal"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-Primary-400 focus:ring-1 focus:ring-Primary-100"
            />
          </div>

          {/* ICD-10 Chapters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">فصول ICD-10 المرتبطة</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(CHAPTER_LABELS).map(([ch, label]) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => toggle(ch)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    selectedChapters.includes(ch)
                      ? 'bg-Primary-500 text-white border-Primary-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-Primary-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Display order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ترتيب العرض</label>
            <input
              type="number"
              min={1}
              value={form.displayOrder}
              onChange={e => setForm(f => ({ ...f, displayOrder: Number(e.target.value) }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-Primary-400 focus:ring-1 focus:ring-Primary-100"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">مفعّل</label>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
              className={`w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-Primary-500' : 'bg-gray-300'}`}
            >
              <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${form.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100">
          <Button fullWidth isLoading={saving} onClick={handleSave}>
            {editing ? 'حفظ التعديلات' : 'إضافة التخصص'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SpecialitiesPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as Locale;

  const [specialities, setSpecialities] = useState<SpecialityDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<SpecialityDto | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<SpecialityDto | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await specialityService.getAll();
      setSpecialities(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSeedDefaults = async () => {
    setSeeding(true);
    setSeedMsg(null);
    try {
      await specialityService.seedDefaults();
      await load();
      setSeedMsg('تم إضافة التخصصات الافتراضية بنجاح');
      setTimeout(() => setSeedMsg(null), 4000);
    } catch {
      setSeedMsg('حدث خطأ أثناء الإضافة');
      setTimeout(() => setSeedMsg(null), 4000);
    } finally {
      setSeeding(false);
    }
  };

  const handleDelete = async (s: SpecialityDto) => {
    setDeleting(s.id);
    try {
      await specialityService.delete(s.id);
      await load();
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  };

  const openAdd = () => { setEditing(null); setDrawerOpen(true); };
  const openEdit = (s: SpecialityDto) => { setEditing(s); setDrawerOpen(true); };
  const handleSaved = () => { setDrawerOpen(false); load(); };

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
            <h1 className="text-xl font-bold text-gray-900">التخصصات الطبية</h1>
            <p className="text-sm text-gray-500 mt-1">إدارة التخصصات المتاحة وتعيينها للعيادات</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSeedDefaults}
              disabled={seeding}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 text-sm font-medium hover:bg-purple-100 transition-colors disabled:opacity-60"
            >
              {seeding ? (
                <span className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>✦</span>
              )}
              إضافة التخصصات الافتراضية
            </button>
            <Button
              variant="primary"
              startIcon={<span className="text-lg font-bold">+</span>}
              onClick={openAdd}
            >
              إضافة تخصص
            </Button>
          </div>
        </div>

        {seedMsg && (
          <div className={`mt-3 text-sm px-4 py-2 rounded-lg ${seedMsg.includes('خطأ') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
            {seedMsg}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="w-6 h-6 border-2 border-Primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : specialities.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🏥</div>
            <p className="font-medium">لا توجد تخصصات بعد</p>
            <p className="text-sm mt-1">أضف التخصصات الافتراضية أو أنشئ تخصصاً جديداً</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">الكود</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">الاسم بالعربي</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">الاسم بالإنجليزي</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">فصول ICD-10</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">الحالة</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {specialities.map(s => (
                <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <span className="inline-block bg-Primary-50 text-Primary-700 text-xs font-bold px-2.5 py-1 rounded-md">
                      {s.code}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.nameAr}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 font-['Inter'] dir-ltr" dir="ltr">{s.nameEn}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {s.icdChapters?.split(',').map(ch => ch.trim()).filter(Boolean).map(ch => (
                        <span key={ch} className="inline-block bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded font-bold">
                          {ch}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                      s.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {s.isActive ? 'مفعّل' : 'موقوف'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(s)}
                        className="text-xs text-Primary-600 hover:text-Primary-800 font-medium px-2.5 py-1 rounded-md hover:bg-Primary-50 transition-colors"
                      >
                        تعديل
                      </button>
                      {confirmDelete?.id === s.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(s)}
                            disabled={deleting === s.id}
                            className="text-xs text-white bg-red-500 hover:bg-red-600 font-medium px-2.5 py-1 rounded-md transition-colors disabled:opacity-60"
                          >
                            {deleting === s.id ? '...' : 'تأكيد'}
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
                          onClick={() => setConfirmDelete(s)}
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
        )}
      </div>

      {/* Drawer */}
      <SpecialityDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSaved={handleSaved}
        editing={editing}
      />
    </div>
  );
}
