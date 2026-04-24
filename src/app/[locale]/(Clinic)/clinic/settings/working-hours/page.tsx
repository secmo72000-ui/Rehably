'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiClient } from '@/services/api-client';
import { getApiError } from '@/shared/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkingHoursDay {
  dayOfWeek: number;  // 0=Sun … 6=Sat
  dayNameAr: string;
  dayNameEn: string;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAY_ICONS = ['☀️', '🌙', '🌙', '🌙', '🌙', '🕌', '⭐'];

// Default schedule used for fresh clinics (before first API call)
const DEFAULT_SCHEDULE: WorkingHoursDay[] = [
  { dayOfWeek: 0, dayNameAr: 'الأحد',    dayNameEn: 'Sunday',    isOpen: true,  openTime: '09:00', closeTime: '17:00' },
  { dayOfWeek: 1, dayNameAr: 'الاثنين',  dayNameEn: 'Monday',    isOpen: true,  openTime: '09:00', closeTime: '17:00' },
  { dayOfWeek: 2, dayNameAr: 'الثلاثاء', dayNameEn: 'Tuesday',   isOpen: true,  openTime: '09:00', closeTime: '17:00' },
  { dayOfWeek: 3, dayNameAr: 'الأربعاء', dayNameEn: 'Wednesday', isOpen: true,  openTime: '09:00', closeTime: '17:00' },
  { dayOfWeek: 4, dayNameAr: 'الخميس',   dayNameEn: 'Thursday',  isOpen: true,  openTime: '09:00', closeTime: '17:00' },
  { dayOfWeek: 5, dayNameAr: 'الجمعة',   dayNameEn: 'Friday',    isOpen: false, openTime: null,    closeTime: null    },
  { dayOfWeek: 6, dayNameAr: 'السبت',    dayNameEn: 'Saturday',  isOpen: true,  openTime: '09:00', closeTime: '14:00' },
];

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ type, message, onClose }: { type: 'success' | 'error'; message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div dir="rtl"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold
        ${type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}
    >
      <span>{type === 'success' ? '✓' : '✕'}</span>
      {message}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WorkingHoursPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';

  const [schedule, setSchedule] = useState<WorkingHoursDay[]>(DEFAULT_SCHEDULE);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [toast,   setToast]     = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
  }, []);

  // Load from API
  useEffect(() => {
    let cancelled = false;
    apiClient.get<WorkingHoursDay[]>('/api/clinic/working-hours')
      .then(res => { if (!cancelled) setSchedule(res.data); })
      .catch(err => { if (!cancelled) showToast('error', getApiError(err, 'تعذّر تحميل ساعات العمل')); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [showToast]);

  const setDay = (dayOfWeek: number, patch: Partial<WorkingHoursDay>) => {
    setSchedule(s => s.map(d => d.dayOfWeek === dayOfWeek ? { ...d, ...patch } : d));
  };

  // Quick-set presets
  const applyPreset = (preset: 'egypt' | 'gulf' | 'alldays') => {
    setSchedule(s => s.map(d => {
      if (preset === 'egypt')   return { ...d, isOpen: d.dayOfWeek !== 5,          openTime: d.dayOfWeek !== 5 ? (d.isOpen ? d.openTime  ?? '09:00' : '09:00') : null, closeTime: d.dayOfWeek !== 5 ? (d.isOpen ? d.closeTime ?? '17:00' : '17:00') : null };
      if (preset === 'gulf')    return { ...d, isOpen: d.dayOfWeek !== 5 && d.dayOfWeek !== 6, openTime: (d.dayOfWeek !== 5 && d.dayOfWeek !== 6) ? (d.openTime  ?? '08:00') : null, closeTime: (d.dayOfWeek !== 5 && d.dayOfWeek !== 6) ? (d.closeTime ?? '16:00') : null };
      /* alldays */              return { ...d, isOpen: true, openTime: d.openTime  ?? '09:00', closeTime: d.closeTime ?? '17:00' };
    }));
  };

  const handleSave = async () => {
    // Validate: every open day must have valid times
    for (const d of schedule) {
      if (d.isOpen) {
        if (!d.openTime || !d.closeTime) {
          showToast('error', `${d.dayNameAr}: يرجى تحديد وقت الفتح والإغلاق`); return;
        }
        if (d.openTime >= d.closeTime) {
          showToast('error', `${d.dayNameAr}: وقت الإغلاق يجب أن يكون بعد وقت الفتح`); return;
        }
      }
    }

    setSaving(true);
    try {
      await apiClient.put('/api/clinic/working-hours', {
        schedule: schedule.map(d => ({
          dayOfWeek: d.dayOfWeek,
          isOpen:    d.isOpen,
          openTime:  d.isOpen ? d.openTime  : null,
          closeTime: d.isOpen ? d.closeTime : null,
        })),
      });
      showToast('success', 'تم حفظ ساعات العمل بنجاح');
    } catch (err) {
      showToast('error', getApiError(err, 'فشل حفظ ساعات العمل'));
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-[#29AAFE] focus:ring-2 focus:ring-[#29AAFE]/10 bg-white disabled:bg-gray-50 disabled:text-gray-300';

  return (
    <div className="space-y-5" dir="rtl">

      {/* Breadcrumb + header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link href={`/${locale}/clinic/settings`} className="hover:text-[#29AAFE] transition-colors">الإعدادات</Link>
            <span>›</span>
            <span className="text-gray-600 font-semibold">ساعات العمل</span>
          </div>
          <h1 className="text-xl font-black text-gray-800">ساعات العمل وأيام الراحة</h1>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="inline-flex items-center gap-2 bg-[#29AAFE] hover:bg-[#1A8FD9] disabled:opacity-50 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          {saving && (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
            </svg>
          )}
          {saving ? 'جارٍ الحفظ…' : 'حفظ ساعات العمل'}
        </button>
      </div>

      {/* Quick-preset buttons */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="text-xs font-bold text-gray-500 mb-3">إعدادات سريعة</div>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'egypt',   label: 'الجمعة إجازة',    hint: 'الأحد–الخميس + السبت' },
            { key: 'gulf',    label: 'الجمعة والسبت',    hint: 'الأحد–الخميس فقط' },
            { key: 'alldays', label: 'كل أيام الأسبوع',  hint: '7 أيام مفتوح' },
          ].map(p => (
            <button key={p.key} type="button" onClick={() => applyPreset(p.key as 'egypt' | 'gulf' | 'alldays')}
              className="flex flex-col items-start px-4 py-2.5 border border-gray-200 rounded-xl hover:border-[#29AAFE] hover:bg-[#E8F5FF] transition-all group">
              <span className="text-xs font-bold text-gray-700 group-hover:text-[#29AAFE]">{p.label}</span>
              <span className="text-[11px] text-gray-400">{p.hint}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Schedule grid */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-700">جدول ساعات العمل الأسبوعي</h2>
          <p className="text-xs text-gray-400 mt-0.5">فعّل الأيام المفتوحة وحدد ساعات العمل لكل يوم</p>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="w-24 h-4 bg-gray-100 rounded animate-pulse" />
                <div className="w-12 h-6 bg-gray-100 rounded-full animate-pulse" />
                <div className="w-32 h-8 bg-gray-100 rounded-lg animate-pulse ml-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {schedule.map(day => (
              <div key={day.dayOfWeek}
                className={`flex items-center gap-4 px-5 py-4 transition-colors ${day.isOpen ? '' : 'bg-gray-50/60'}`}>

                {/* Day name */}
                <div className="w-28 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{DAY_ICONS[day.dayOfWeek]}</span>
                    <div>
                      <div className={`text-sm font-bold ${day.isOpen ? 'text-gray-800' : 'text-gray-400'}`}>{day.dayNameAr}</div>
                      <div className="text-[11px] text-gray-400">{day.dayNameEn}</div>
                    </div>
                  </div>
                </div>

                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => setDay(day.dayOfWeek, {
                    isOpen: !day.isOpen,
                    openTime:  !day.isOpen && !day.openTime  ? '09:00' : day.openTime,
                    closeTime: !day.isOpen && !day.closeTime ? '17:00' : day.closeTime,
                  })}
                  className={`relative inline-flex w-11 h-6 rounded-full transition-colors shrink-0 ${day.isOpen ? 'bg-[#29AAFE]' : 'bg-gray-200'}`}
                  aria-label={day.isOpen ? 'إغلاق اليوم' : 'فتح اليوم'}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${day.isOpen ? 'right-0.5' : 'left-0.5'}`} />
                </button>

                {/* Status / time inputs */}
                {day.isOpen ? (
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-gray-400 shrink-0">من</span>
                      <input
                        type="time"
                        value={day.openTime ?? ''}
                        onChange={e => setDay(day.dayOfWeek, { openTime: e.target.value })}
                        className={inputCls}
                        dir="ltr"
                      />
                    </div>
                    <span className="text-gray-300 text-sm">—</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-gray-400 shrink-0">إلى</span>
                      <input
                        type="time"
                        value={day.closeTime ?? ''}
                        onChange={e => setDay(day.dayOfWeek, { closeTime: e.target.value })}
                        className={inputCls}
                        dir="ltr"
                      />
                    </div>
                    {/* Duration chip */}
                    {day.openTime && day.closeTime && day.openTime < day.closeTime && (() => {
                      const [oh, om] = day.openTime.split(':').map(Number);
                      const [ch, cm] = day.closeTime.split(':').map(Number);
                      const mins = (ch * 60 + cm) - (oh * 60 + om);
                      const h = Math.floor(mins / 60);
                      const m = mins % 60;
                      return (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#E8F5FF] text-[#29AAFE] font-bold shrink-0">
                          {h > 0 ? `${h} س` : ''}{m > 0 ? ` ${m} د` : ''}
                        </span>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-400 text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                      يوم إجازة
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary card */}
      {!loading && (
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="text-xs font-bold text-gray-500 mb-3">ملخص ساعات العمل</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#E8F5FF] rounded-xl p-3 text-center">
              <div className="text-2xl font-black text-[#29AAFE]">{schedule.filter(d => d.isOpen).length}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">أيام عمل</div>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-black text-red-400">{schedule.filter(d => !d.isOpen).length}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">أيام إجازة</div>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-black text-green-600">
                {(() => {
                  const total = schedule.filter(d => d.isOpen && d.openTime && d.closeTime && d.openTime < d.closeTime)
                    .reduce((sum, d) => {
                      const [oh, om] = d.openTime!.split(':').map(Number);
                      const [ch, cm] = d.closeTime!.split(':').map(Number);
                      return sum + ((ch * 60 + cm) - (oh * 60 + om));
                    }, 0);
                  return `${Math.floor(total / 60)}س`;
                })()}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">إجمالي ساعات الأسبوع</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <div className="text-sm font-black text-purple-600">
                {schedule.find(d => !d.isOpen)?.dayNameAr ?? '—'}
                {schedule.filter(d => !d.isOpen).length > 1 && <span className="text-xs"> +{schedule.filter(d => !d.isOpen).length - 1}</span>}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">أيام الإجازة</div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
