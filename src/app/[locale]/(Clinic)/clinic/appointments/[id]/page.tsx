'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { appointmentsService } from '@/domains/appointments/appointments.service';
import type { AppointmentItem } from '@/domains/appointments/appointments.types';
import { getApiError } from '@/shared/utils';

// ── Helpers ───────────────────────────────────────────────────────────────────

const typeLabels: Record<string, string> = {
  Treatment:   'جلسة علاجية',
  Assessment:  'تقييم',
  Followup:    'متابعة',
  Consultation: 'استشارة',
};

const statusConfig: Record<string, { label: string; cls: string; dot: string }> = {
  Scheduled:  { label: 'مجدول',       cls: 'bg-blue-50 text-blue-600 border border-blue-200',       dot: 'bg-blue-500' },
  Confirmed:  { label: 'مؤكد',        cls: 'bg-green-50 text-green-600 border border-green-200',     dot: 'bg-green-500' },
  CheckedIn:  { label: 'حضر المريض',  cls: 'bg-teal-50 text-teal-600 border border-teal-200',        dot: 'bg-teal-500' },
  InProgress: { label: 'قيد التقييم', cls: 'bg-purple-50 text-purple-600 border border-purple-200',  dot: 'bg-purple-500' },
  Completed:  { label: 'مكتمل',       cls: 'bg-gray-100 text-gray-600 border border-gray-200',       dot: 'bg-gray-500' },
  Cancelled:  { label: 'ملغي',        cls: 'bg-red-50 text-red-500 border border-red-200',           dot: 'bg-red-500' },
  NoShow:     { label: 'لم يحضر',     cls: 'bg-orange-50 text-orange-500 border border-orange-200',  dot: 'bg-orange-500' },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('ar-EG', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}

function fmtCreated(iso: string) {
  return new Date(iso).toLocaleDateString('ar-EG', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

// ── Info Card Row ─────────────────────────────────────────────────────────────

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-3 border-b border-gray-100 last:border-0">
      <span className="text-xs font-bold text-gray-400">{label}</span>
      <div className="text-sm font-semibold text-gray-800">{children}</div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ message, type, onDismiss }: {
  message: string;
  type: 'success' | 'error';
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-lg text-sm font-bold transition-all
        ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
    >
      <span>{type === 'success' ? '✓' : '✕'}</span>
      {message}
    </div>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────

function ConfirmModal({ message, onConfirm, onClose, loading }: {
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E8F5FF] flex items-center justify-center shrink-0 text-[#29AAFE] text-lg">
            ؟
          </div>
          <p className="text-sm font-semibold text-gray-700 mt-1.5 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-[#29AAFE] hover:bg-[#1A8FD9] text-white text-sm font-bold transition-colors disabled:opacity-60"
          >
            {loading ? 'جاري...' : 'تأكيد'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Cancel Modal ──────────────────────────────────────────────────────────────

function CancelModal({ onClose, onCancel, loading }: {
  onClose: () => void;
  onCancel: (reason: string) => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!reason.trim()) return;
    onCancel(reason.trim());
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-gray-800">إلغاء الموعد</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 text-sm"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
              سبب الإلغاء <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              onBlur={() => setTouched(true)}
              rows={4}
              placeholder="أدخل سبب إلغاء الموعد..."
              className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none resize-none transition-colors
                ${touched && !reason.trim()
                  ? 'border-red-300 focus:border-red-400 bg-red-50'
                  : 'border-gray-200 focus:border-[#29AAFE]'
                }`}
            />
            {touched && !reason.trim() && (
              <p className="text-xs text-red-500 mt-1">سبب الإلغاء مطلوب</p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              تراجع
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors disabled:opacity-60"
            >
              {loading ? 'جاري الإلغاء...' : 'تأكيد الإلغاء'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type ModalState =
  | { type: 'none' }
  | { type: 'confirm-confirm' }
  | { type: 'confirm-checkin' }
  | { type: 'confirm-complete' }
  | { type: 'cancel' };

type ToastState = { message: string; kind: 'success' | 'error' } | null;

export default function AppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'ar';
  const id = params?.id as string;

  const [appointment, setAppointment] = useState<AppointmentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modal, setModal] = useState<ModalState>({ type: 'none' });
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await appointmentsService.getById(id);
      setAppointment(data);
    } catch (err) {
      setError(getApiError(err, 'فشل في تحميل بيانات الموعد'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const showToast = (message: string, kind: 'success' | 'error') =>
    setToast({ message, kind });

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await appointmentsService.checkIn(id);
      setModal({ type: 'none' });
      showToast('تم تسجيل وصول المريض', 'success');
      await load();
    } catch (err) {
      showToast(getApiError(err, 'فشل في تسجيل الوصول'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirm = async () => {
    setActionLoading(true);
    try {
      await appointmentsService.confirm(id);
      setModal({ type: 'none' });
      showToast('تم تأكيد الموعد بنجاح', 'success');
      await load();
    } catch (err) {
      showToast(getApiError(err, 'فشل في تأكيد الموعد'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    setActionLoading(true);
    try {
      await appointmentsService.complete(id);
      setModal({ type: 'none' });
      showToast('تم إتمام الموعد بنجاح', 'success');
      await load();
    } catch (err) {
      showToast(getApiError(err, 'فشل في إتمام الموعد'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (reason: string) => {
    setActionLoading(true);
    try {
      await appointmentsService.cancel(id, reason);
      setModal({ type: 'none' });
      showToast('تم إلغاء الموعد', 'success');
      await load();
    } catch (err) {
      showToast(getApiError(err, 'فشل في إلغاء الموعد'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-3" dir="rtl">
        <div className="w-10 h-10 rounded-full border-4 border-[#29AAFE] border-t-transparent animate-spin" />
        <span className="text-sm text-gray-400">جاري تحميل الموعد...</span>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────────
  if (error || !appointment) {
    return (
      <div className="space-y-4" dir="rtl">
        <Link
          href={`/${locale}/clinic/appointments`}
          className="inline-flex items-center gap-1.5 text-gray-400 hover:text-[#29AAFE] text-sm transition-colors"
        >
          ← العودة للمواعيد
        </Link>
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-4 text-sm">
          {error ?? 'الموعد غير موجود'}
        </div>
      </div>
    );
  }

  const status = statusConfig[appointment.status] ?? {
    label: appointment.status,
    cls:   'bg-gray-100 text-gray-600 border border-gray-200',
    dot:   'bg-gray-400',
  };
  const typeLabel  = typeLabels[appointment.type] ?? appointment.type;
  const pageTitle  = appointment.title || typeLabel;
  const isCancellable = appointment.status === 'Scheduled' || appointment.status === 'Confirmed';
  const canCheckIn = appointment.status === 'Scheduled' || appointment.status === 'Confirmed';
  const canStartAssessment = appointment.status === 'CheckedIn' || appointment.status === 'InProgress';

  return (
    <div className="space-y-5" dir="rtl">

      {/* ── Header ── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        {/* Back link */}
        <Link
          href={`/${locale}/clinic/appointments`}
          className="inline-flex items-center gap-1.5 text-gray-400 hover:text-[#29AAFE] text-xs font-semibold mb-4 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          العودة للمواعيد
        </Link>

        {/* Title + badge row */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl bg-[#E8F5FF] flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#29AAFE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-800">{pageTitle}</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {fmtDate(appointment.startTime)}
              </p>
            </div>
          </div>

          {/* Status badge */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${status.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>

        {/* Action buttons */}
        {(canCheckIn || canStartAssessment || isCancellable) && (
          <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-gray-100">
            {/* Scheduled → confirm */}
            {appointment.status === 'Scheduled' && (
              <button
                onClick={() => setModal({ type: 'confirm-confirm' })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-bold transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                تأكيد الموعد
              </button>
            )}

            {/* Scheduled/Confirmed → check-in (reception) */}
            {canCheckIn && (
              <button
                onClick={() => setModal({ type: 'confirm-checkin' })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-bold transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                تسجيل الوصول
              </button>
            )}

            {/* CheckedIn / InProgress → start/continue assessment (doctor) */}
            {canStartAssessment && (
              <button
                onClick={() => router.push(`/${locale}/clinic/appointments/${id}/assessment`)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold transition-colors shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {appointment.status === 'InProgress' ? 'متابعة التقييم' : 'بدء التقييم'}
              </button>
            )}

            {/* Cancel */}
            {isCancellable && (
              <button
                onClick={() => setModal({ type: 'cancel' })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-300 text-red-500 hover:bg-red-50 text-sm font-bold transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                إلغاء الموعد
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Info grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Card 1 – Parties */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-black text-gray-800 mb-1">المشاركون</h2>

          <InfoRow label="المريض">
            <Link
              href={`/${locale}/clinic/patients/${appointment.patientId}`}
              className="text-[#29AAFE] hover:underline font-semibold"
            >
              {appointment.patientName}
            </Link>
          </InfoRow>

          <InfoRow label="المعالج">
            {appointment.therapistName ?? <span className="text-gray-400 font-normal">غير محدد</span>}
          </InfoRow>

          {appointment.treatmentPlanId && (
            <InfoRow label="خطة العلاج المرتبطة">
              <Link
                href={`/${locale}/clinic/treatment-plans/${appointment.treatmentPlanId}`}
                className="text-[#29AAFE] hover:underline font-semibold"
              >
                {appointment.treatmentPlanTitle ?? 'عرض خطة العلاج'}
              </Link>
            </InfoRow>
          )}
        </div>

        {/* Card 2 – Time & Type */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-black text-gray-800 mb-1">تفاصيل الموعد</h2>

          <InfoRow label="تاريخ ونوع الموعد">
            <span>{fmtDate(appointment.startTime)}</span>
            <span className="mx-1.5 text-gray-300">·</span>
            <span className="text-[#29AAFE]">{typeLabel}</span>
          </InfoRow>

          <InfoRow label="وقت البداية">
            {fmtTime(appointment.startTime)}
          </InfoRow>

          <InfoRow label="وقت النهاية">
            {fmtTime(appointment.endTime)}
          </InfoRow>

          <InfoRow label="المدة">
            {appointment.durationMinutes} دقيقة
          </InfoRow>

          <InfoRow label="تاريخ الإنشاء">
            {fmtCreated(appointment.createdAt)}
          </InfoRow>
        </div>

        {/* Card 3 – Notes (full width if present) */}
        {appointment.notes && (
          <div className="bg-white rounded-2xl p-5 shadow-sm lg:col-span-2">
            <h2 className="text-sm font-black text-gray-800 mb-3">الملاحظات</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {appointment.notes}
            </p>
          </div>
        )}

        {/* Card 4 – Cancellation reason (only if Cancelled) */}
        {appointment.status === 'Cancelled' && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5 lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-sm font-black text-red-700">سبب الإلغاء</h2>
            </div>
            <p className="text-sm text-red-600 leading-relaxed">
              {appointment.cancellationReason ?? 'لم يتم تحديد سبب'}
            </p>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {modal.type === 'confirm-confirm' && (
        <ConfirmModal
          message="هل أنت متأكد من تأكيد الموعد؟"
          onConfirm={handleConfirm}
          onClose={() => setModal({ type: 'none' })}
          loading={actionLoading}
        />
      )}

      {modal.type === 'confirm-checkin' && (
        <ConfirmModal
          message="تأكيد وصول المريض وسداد الدفعة؟ سيتم تغيير حالة الموعد إلى «حضر المريض»."
          onConfirm={handleCheckIn}
          onClose={() => setModal({ type: 'none' })}
          loading={actionLoading}
        />
      )}

      {modal.type === 'confirm-complete' && (
        <ConfirmModal
          message="هل أنت متأكد من إتمام الموعد؟ سيتم تغيير حالته إلى مكتمل."
          onConfirm={handleComplete}
          onClose={() => setModal({ type: 'none' })}
          loading={actionLoading}
        />
      )}

      {modal.type === 'cancel' && (
        <CancelModal
          onClose={() => setModal({ type: 'none' })}
          onCancel={handleCancel}
          loading={actionLoading}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.kind}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
