'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { treatmentPlansService } from '@/domains/treatment-plans/treatment-plans.service';
import type { TreatmentPlanDetail, SessionItem } from '@/domains/treatment-plans/treatment-plans.types';
import { getApiError } from '@/shared/utils';

// ── Status maps ────────────────────────────────────────────────────────────────

const planStatusMap: Record<string, { label: string; cls: string }> = {
  Draft:     { label: 'مسودة',   cls: 'bg-gray-100 text-gray-500' },
  Active:    { label: 'نشط',     cls: 'bg-[#E8F5FF] text-[#29AAFE]' },
  Completed: { label: 'مكتمل',  cls: 'bg-green-50 text-green-600' },
  Cancelled: { label: 'ملغي',   cls: 'bg-red-50 text-red-500' },
};

const sessionStatusMap: Record<string, { label: string; cls: string }> = {
  Scheduled: { label: 'مجدولة',  cls: 'bg-[#E8F5FF] text-[#29AAFE]' },
  Completed: { label: 'مكتملة',  cls: 'bg-green-50 text-green-600' },
  Cancelled: { label: 'ملغية',   cls: 'bg-red-50 text-red-500' },
  NoShow:    { label: 'لم يحضر', cls: 'bg-orange-50 text-orange-500' },
};

// ── Toast ──────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error';

interface ToastMsg {
  id: number;
  message: string;
  type: ToastType;
}

function ToastContainer({ toasts, onDismiss }: { toasts: ToastMsg[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          onClick={() => onDismiss(t.id)}
          className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg text-sm font-bold cursor-pointer transition-all
            ${t.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
        >
          <span>{t.type === 'success' ? '✓' : '✕'}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const counterRef = React.useRef(0);

  const show = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now() + counterRef.current++;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, show, dismiss };
}

// ── Confirm Dialog ─────────────────────────────────────────────────────────────

function ConfirmDialog({ title, message, confirmLabel, confirmCls, onConfirm, onCancel }: {
  title: string;
  message: string;
  confirmLabel: string;
  confirmCls: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-base font-black text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors ${confirmCls}`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Session Modal ──────────────────────────────────────────────────────────

function AddSessionModal({ planId, onClose, onSaved }: {
  planId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({ sessionDate: '', durationMinutes: 60, notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!form.sessionDate) { setError('يرجى تحديد تاريخ الجلسة'); return; }
    setSaving(true);
    setError(null);
    try {
      await treatmentPlansService.addSession(planId, {
        sessionDate: new Date(form.sessionDate).toISOString(),
        durationMinutes: form.durationMinutes,
        notes: form.notes || undefined,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(getApiError(err, 'فشل في إضافة الجلسة'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <span className="text-base font-black text-gray-800">إضافة جلسة جديدة</span>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 text-sm">✕</button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-xs rounded-xl px-3 py-2">{error}</div>}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">تاريخ الجلسة *</label>
            <input
              type="datetime-local"
              value={form.sessionDate}
              onChange={e => setForm(f => ({ ...f, sessionDate: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#29AAFE] bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">مدة الجلسة (دقيقة)</label>
            <input
              type="number"
              min={15}
              step={15}
              value={form.durationMinutes}
              onChange={e => setForm(f => ({ ...f, durationMinutes: Number(e.target.value) }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#29AAFE]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">ملاحظات</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#29AAFE] resize-none"
            />
          </div>
        </div>
        {/* Footer */}
        <div className="p-5 border-t border-gray-100 shrink-0">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#29AAFE] hover:bg-[#1A8FD9] disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-colors"
          >
            {saving ? 'جاري الحفظ...' : 'إضافة الجلسة'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Complete Session Modal ─────────────────────────────────────────────────────

function CompleteSessionModal({ session, onClose, onSaved }: {
  session: SessionItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    notes: session.notes ?? '',
    patientProgress: session.patientProgress ?? '',
    painLevel: session.painLevel ?? 0,
    patientSatisfaction: session.patientSatisfaction ?? 3,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await treatmentPlansService.completeSession(session.id, {
        notes: form.notes || undefined,
        patientProgress: form.patientProgress || undefined,
        painLevel: form.painLevel,
        patientSatisfaction: form.patientSatisfaction,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(getApiError(err, 'فشل في إتمام الجلسة'));
    } finally {
      setSaving(false);
    }
  };

  const painColor = form.painLevel <= 3 ? 'text-green-600' : form.painLevel <= 6 ? 'text-orange-500' : 'text-red-500';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <div>
            <span className="text-base font-black text-gray-800">إتمام الجلسة</span>
            <span className="text-sm text-gray-400 mr-2">#{session.sessionNumber}</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 text-sm">✕</button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {error && <div className="bg-red-50 text-red-600 text-xs rounded-xl px-3 py-2">{error}</div>}

          {/* Pain level */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-600">مستوى الألم</label>
              <span className={`text-sm font-black ${painColor}`}>{form.painLevel} <span className="text-gray-400 font-normal text-xs">/ 10</span></span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              value={form.painLevel}
              onChange={e => setForm(f => ({ ...f, painLevel: Number(e.target.value) }))}
              className="w-full accent-[#29AAFE]"
            />
            <div className="flex justify-between text-xs text-gray-300 mt-1">
              <span>0</span>
              <span className="text-gray-400 text-xs">من 0 إلى 10</span>
              <span>10</span>
            </div>
          </div>

          {/* Patient satisfaction */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-600">رضا المريض</label>
              <span className="text-sm font-black text-amber-500">{'★'.repeat(form.patientSatisfaction)}{'☆'.repeat(5 - form.patientSatisfaction)}</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={form.patientSatisfaction}
              onChange={e => setForm(f => ({ ...f, patientSatisfaction: Number(e.target.value) }))}
              className="w-full accent-amber-400"
            />
            <div className="flex justify-between text-xs text-gray-300 mt-1">
              <span>1</span>
              <span>5</span>
            </div>
          </div>

          {/* Patient progress */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">تقدم المريض</label>
            <textarea
              value={form.patientProgress}
              onChange={e => setForm(f => ({ ...f, patientProgress: e.target.value }))}
              rows={3}
              placeholder="وصف تقدم المريض خلال هذه الجلسة..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#29AAFE] resize-none"
            />
          </div>

          {/* Session notes */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">ملاحظات الجلسة</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3}
              placeholder="ملاحظات إضافية عن الجلسة..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#29AAFE] resize-none"
            />
          </div>
        </div>
        {/* Footer */}
        <div className="p-5 border-t border-gray-100 shrink-0">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-colors"
          >
            {saving ? 'جاري الحفظ...' : 'تأكيد إتمام الجلسة'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Small info card ────────────────────────────────────────────────────────────

function InfoCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-[#E8F5FF] flex items-center justify-center text-base shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-semibold mb-0.5">{label}</p>
        <p className="text-sm font-black text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function TreatmentPlanDetailPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';
  const planId = params?.id as string;

  const [plan, setPlan] = useState<TreatmentPlanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [showAddSession, setShowAddSession] = useState(false);
  const [completeSession, setCompleteSession] = useState<SessionItem | null>(null);
  const [confirmAction, setConfirmAction] = useState<'activate' | 'complete' | null>(null);

  const { toasts, show: showToast, dismiss: dismissToast } = useToast();

  const load = useCallback(async () => {
    if (!planId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await treatmentPlansService.getById(planId);
      setPlan(data);
    } catch (err) {
      setError(getApiError(err, 'فشل في تحميل خطة العلاج'));
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => { load(); }, [load]);

  // ── Action handlers ──────────────────────────────────────────────────────────

  const handleActivate = async () => {
    if (!plan) return;
    setActionLoading(true);
    try {
      const updated = await treatmentPlansService.activate(plan.id);
      setPlan(updated);
      showToast('تم تفعيل خطة العلاج بنجاح', 'success');
    } catch (err) {
      showToast(getApiError(err, 'فشل في تفعيل خطة العلاج'), 'error');
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleComplete = async () => {
    if (!plan) return;
    setActionLoading(true);
    try {
      const updated = await treatmentPlansService.complete(plan.id);
      setPlan(updated);
      showToast('تم إتمام خطة العلاج بنجاح', 'success');
    } catch (err) {
      showToast(getApiError(err, 'فشل في إتمام خطة العلاج'), 'error');
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleSessionSaved = async () => {
    showToast('تمت العملية بنجاح', 'success');
    await load();
  };

  // ── Loading / Error ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400" dir="rtl">
        <div className="w-8 h-8 border-2 border-[#29AAFE] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">جاري تحميل خطة العلاج...</span>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="space-y-4" dir="rtl">
        <Link
          href={`/${locale}/clinic/treatment-plans`}
          className="inline-flex items-center gap-1.5 text-gray-400 hover:text-[#29AAFE] text-sm transition-colors"
        >
          <span>›</span>
          <span>العودة لخطط العلاج</span>
        </Link>
        <div className="bg-red-50 text-red-600 rounded-2xl px-5 py-4 text-sm">
          {error ?? 'خطة العلاج غير موجودة'}
        </div>
      </div>
    );
  }

  // ── Derived values ───────────────────────────────────────────────────────────

  const s = planStatusMap[plan.status] ?? { label: plan.status, cls: 'bg-gray-100 text-gray-500' };
  const pct = plan.totalSessionsPlanned > 0
    ? Math.round((plan.completedSessions / plan.totalSessionsPlanned) * 100)
    : 0;

  const descFields: { key: string; value: string | null | undefined }[] = [
    { key: 'الوصف',      value: plan.description },
    { key: 'الأهداف',    value: plan.goals },
    { key: 'التشخيص',   value: plan.diagnosis },
    { key: 'الملاحظات', value: plan.notes },
  ].filter(f => f.value);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5" dir="rtl">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* Left: back + title + badge */}
        <div className="flex flex-col gap-2 min-w-0">
          <Link
            href={`/${locale}/clinic/treatment-plans`}
            className="inline-flex items-center gap-1.5 text-gray-400 hover:text-[#29AAFE] text-sm transition-colors w-fit"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span>العودة لخطط العلاج</span>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-black text-gray-800">{plan.title}</h1>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${s.cls}`}>{s.label}</span>
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {plan.status === 'Draft' && (
            <button
              onClick={() => setConfirmAction('activate')}
              disabled={actionLoading}
              className="flex items-center gap-2 bg-[#29AAFE] hover:bg-[#1A8FD9] disabled:opacity-60 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              تفعيل الخطة
            </button>
          )}
          {plan.status === 'Active' && (
            <button
              onClick={() => setConfirmAction('complete')}
              disabled={actionLoading}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              إتمام الخطة
            </button>
          )}
        </div>
      </div>

      {/* ── Info cards row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <InfoCard label="المريض"        icon="👤" value={plan.patientName} />
        <InfoCard label="المعالج"       icon="👨‍⚕️" value={plan.therapistName ?? 'غير محدد'} />
        <InfoCard label="تاريخ البداية" icon="📅" value={new Date(plan.startDate).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' })} />
        <InfoCard label="إجمالي الجلسات" icon="🗓️" value={`${plan.completedSessions} / ${plan.totalSessionsPlanned}`} />
      </div>

      {/* ── Progress bar ── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-gray-700">تقدم الجلسات</span>
          <span className="text-sm font-black text-[#29AAFE]">{pct}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#29AAFE] rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>{plan.completedSessions} جلسة مكتملة</span>
          <span>من أصل {plan.totalSessionsPlanned} جلسة</span>
        </div>
      </div>

      {/* ── Description / Goals / Notes — 2-col grid ── */}
      {descFields.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {descFields.map(f => (
            <div key={f.key} className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-wide mb-2">{f.key}</h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{f.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Sessions section ── */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Section header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-gray-800">الجلسات</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
              {plan.sessions?.length ?? 0}
            </span>
          </div>
          {plan.status === 'Active' && (
            <button
              onClick={() => setShowAddSession(true)}
              className="flex items-center gap-1.5 bg-[#29AAFE] hover:bg-[#1A8FD9] text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors"
            >
              <span className="text-base leading-none">+</span>
              إضافة جلسة
            </button>
          )}
        </div>

        {/* Empty state */}
        {(!plan.sessions || plan.sessions.length === 0) ? (
          <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
            <span className="text-5xl">🗓️</span>
            <span className="text-sm font-semibold">لا توجد جلسات بعد</span>
            {plan.status === 'Active' && (
              <button
                onClick={() => setShowAddSession(true)}
                className="mt-2 bg-[#29AAFE] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#1A8FD9] transition-colors"
              >
                إضافة أول جلسة
              </button>
            )}
          </div>
        ) : (
          /* Sessions table */
          <div className="overflow-x-auto">
            <table className="w-full text-sm" dir="rtl">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 whitespace-nowrap">رقم</th>
                  <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 whitespace-nowrap">التاريخ</th>
                  <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 whitespace-nowrap">المعالج</th>
                  <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 whitespace-nowrap">المدة (دقيقة)</th>
                  <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 whitespace-nowrap">الحالة</th>
                  <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 whitespace-nowrap">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {plan.sessions.map((session, idx) => {
                  const ss = sessionStatusMap[session.status] ?? { label: session.status, cls: 'bg-gray-100 text-gray-500' };
                  const isLast = idx === plan.sessions.length - 1;
                  return (
                    <tr
                      key={session.id}
                      className={`hover:bg-gray-50/50 transition-colors ${!isLast ? 'border-b border-gray-100' : ''}`}
                    >
                      {/* # */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-black text-gray-800">#{session.sessionNumber}</span>
                      </td>
                      {/* Date */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-gray-600 text-xs">
                        {new Date(session.sessionDate).toLocaleDateString('ar-SA', {
                          weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                        })}
                        <span className="block text-gray-400 mt-0.5">
                          {new Date(session.sessionDate).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      {/* Therapist */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-500">
                        {session.therapistName ?? <span className="text-gray-300">—</span>}
                      </td>
                      {/* Duration */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-600">
                        {session.durationMinutes}
                      </td>
                      {/* Status badge */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${ss.cls}`}>
                          {ss.label}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {session.status === 'Scheduled' ? (
                          <button
                            onClick={() => setCompleteSession(session)}
                            className="text-xs px-3 py-1.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-500 hover:text-white transition-colors font-bold"
                          >
                            إتمام الجلسة
                          </button>
                        ) : session.status === 'Completed' ? (
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            {session.painLevel != null && (
                              <span className="bg-gray-50 px-2 py-1 rounded-lg">ألم: {session.painLevel}/10</span>
                            )}
                            {session.patientSatisfaction != null && (
                              <span className="text-amber-400">{'★'.repeat(session.patientSatisfaction)}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modals ── */}

      {showAddSession && (
        <AddSessionModal
          planId={plan.id}
          onClose={() => setShowAddSession(false)}
          onSaved={handleSessionSaved}
        />
      )}

      {completeSession && (
        <CompleteSessionModal
          session={completeSession}
          onClose={() => setCompleteSession(null)}
          onSaved={handleSessionSaved}
        />
      )}

      {confirmAction === 'activate' && (
        <ConfirmDialog
          title="تفعيل خطة العلاج"
          message="هل أنت متأكد من تفعيل هذه الخطة؟ بعد التفعيل ستصبح الخطة نشطة ويمكن إضافة جلسات إليها."
          confirmLabel={actionLoading ? 'جاري التفعيل...' : 'تفعيل الخطة'}
          confirmCls="bg-[#29AAFE] hover:bg-[#1A8FD9]"
          onConfirm={handleActivate}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {confirmAction === 'complete' && (
        <ConfirmDialog
          title="إتمام خطة العلاج"
          message="هل أنت متأكد من إتمام هذه الخطة؟ بعد الإتمام لن تتمكن من إضافة جلسات جديدة."
          confirmLabel={actionLoading ? 'جاري الإتمام...' : 'إتمام الخطة'}
          confirmCls="bg-green-500 hover:bg-green-600"
          onConfirm={handleComplete}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {/* ── Toast container ── */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
