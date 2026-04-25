'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { specialityService } from '@/domains/clinical';
import type { SpecialityDto, ClinicSpecialityDto } from '@/domains/clinical';

interface Props {
  clinicId: string;
  t: (key: string) => string;
  isRtl: boolean;
}

export function SpecialitySection({ clinicId, t, isRtl }: Props) {
  const [assigned, setAssigned] = useState<ClinicSpecialityDto[]>([]);
  const [all, setAll] = useState<SpecialityDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const flash = (text: string, ok: boolean) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3500);
  };

  const loadAssigned = useCallback(async () => {
    setLoading(true);
    try {
      const data = await specialityService.getClinicSpecialities(clinicId);
      setAssigned(data);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  const loadAll = useCallback(async () => {
    try {
      const data = await specialityService.getAll(true);
      setAll(data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    loadAssigned();
    loadAll();
  }, [loadAssigned, loadAll]);

  const assignedIds = new Set(assigned.map(a => a.specialityId));
  const available = all.filter(s => !assignedIds.has(s.id));

  const toggleSelect = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleAssign = async () => {
    if (selected.length === 0) return;
    setSaving(true);
    try {
      await specialityService.assignToClinic(clinicId, selected);
      await loadAssigned();
      setSelected([]);
      setShowAdd(false);
      flash('تم تعيين التخصصات بنجاح', true);
    } catch {
      flash('حدث خطأ أثناء التعيين', false);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (specialityId: string) => {
    setRemoving(specialityId);
    try {
      await specialityService.removeFromClinic(clinicId, specialityId);
      await loadAssigned();
      flash('تم إزالة التخصص', true);
    } catch {
      flash('حدث خطأ أثناء الإزالة', false);
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className={isRtl ? 'text-right' : 'text-left'} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <label className="block text-sm text-gray-600 font-bold">
          التخصصات المعينة للعيادة
        </label>
        <button
          onClick={() => { setShowAdd(v => !v); setSelected([]); }}
          className="text-xs text-Primary-600 hover:text-Primary-800 font-medium px-3 py-1.5 rounded-lg border border-Primary-200 hover:bg-Primary-50 transition-colors"
        >
          {showAdd ? 'إلغاء' : '+ إضافة تخصص'}
        </button>
      </div>

      {/* Flash message */}
      {msg && (
        <div className={`mb-3 text-xs px-3 py-2 rounded-lg ${msg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {msg.text}
        </div>
      )}

      {/* Assigned badges */}
      {loading ? (
        <div className="flex items-center gap-2 py-3">
          <span className="w-4 h-4 border-2 border-Primary-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-400">جاري التحميل...</span>
        </div>
      ) : assigned.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-xl p-4 text-center text-gray-400 text-xs">
          لم يتم تعيين أي تخصص لهذه العيادة بعد
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 mb-3">
          {assigned.map(a => (
            <div
              key={a.specialityId}
              className="flex items-center gap-1.5 bg-Primary-50 border border-Primary-100 text-Primary-800 text-xs font-medium px-3 py-1.5 rounded-full"
            >
              <span className="font-bold text-Primary-600">{a.code}</span>
              <span>{a.nameAr}</span>
              <button
                onClick={() => handleRemove(a.specialityId)}
                disabled={removing === a.specialityId}
                className="w-4 h-4 rounded-full flex items-center justify-center text-Primary-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {removing === a.specialityId ? (
                  <span className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-base leading-none">×</span>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add panel */}
      {showAdd && (
        <div className="border border-gray-200 rounded-xl p-4 mt-3 space-y-3 bg-gray-50">
          <p className="text-xs font-semibold text-gray-600">اختر التخصصات للإضافة</p>
          {available.length === 0 ? (
            <p className="text-xs text-gray-400">جميع التخصصات المتاحة معينة بالفعل</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {available.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSelect(s.id)}
                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                      selected.includes(s.id)
                        ? 'bg-Primary-500 text-white border-Primary-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-Primary-300'
                    }`}
                  >
                    <span className="font-bold">{s.code}</span>
                    <span>{s.nameAr}</span>
                    {selected.includes(s.id) && <span>✓</span>}
                  </button>
                ))}
              </div>
              <button
                onClick={handleAssign}
                disabled={saving || selected.length === 0}
                className="mt-2 px-4 py-2 bg-Primary-500 hover:bg-Primary-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving && (
                  <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                )}
                تعيين {selected.length > 0 && `(${selected.length})`}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
