'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { staffService } from '@/domains/staff/staff.service';
import type { StaffMember, UpdateStaffRequest } from '@/domains/staff/staff.types';

// ── Helpers ────────────────────────────────────────────────

function fmtDate(iso?: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getInitials(member: StaffMember): string {
  return ((member.firstName?.[0] ?? '') + (member.lastName?.[0] ?? '')).toUpperCase();
}

// ── Toast ──────────────────────────────────────────────────

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg text-sm font-bold ${
        type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      }`}
    >
      <span>{type === 'success' ? '✓' : '✕'}</span>
      <span>{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 mr-1">✕</button>
    </div>
  );
}

// ── Confirm Dialog ─────────────────────────────────────────

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  confirmCls,
  onConfirm,
  onCancel,
  loading,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  confirmCls: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      dir="rtl"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-base font-black text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-colors disabled:opacity-60 ${confirmCls}`}
          >
            {loading ? 'جارٍ...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Field ──────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#29AAFE] transition-colors"
        dir="rtl"
      />
    </div>
  );
}

// ── Info Row ───────────────────────────────────────────────

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-bold text-gray-400">{label}</span>
      <div className="text-sm text-gray-800">{children}</div>
    </div>
  );
}

// ── Avatar ─────────────────────────────────────────────────

function Avatar({ member }: { member: StaffMember }) {
  if (member.profileImageUrl) {
    return (
      <img
        src={member.profileImageUrl}
        alt={member.fullName}
        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
      />
    );
  }
  return (
    <div
      className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-black border-4 border-white shadow-md"
      style={{ background: 'linear-gradient(135deg, #29AAFE, #1A8FD9)' }}
    >
      {getInitials(member)}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────

export default function StaffDetailPage() {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'ar';
  const id = params?.id as string;

  const [member, setMember] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', phoneNumber: '' });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<'deactivate' | 'reactivate' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadMember = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await staffService.getById(id);
      setMember(data);
      setEditForm({
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber ?? '',
      });
    } catch {
      setError('فشل في تحميل بيانات الموظف.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadMember();
  }, [loadMember]);

  const handleSaveEdit = async () => {
    if (!member) return;
    setSaving(true);
    setEditError(null);
    try {
      const payload: UpdateStaffRequest = {
        firstName: editForm.firstName || undefined,
        lastName: editForm.lastName || undefined,
        phoneNumber: editForm.phoneNumber || undefined,
      };
      const updated = await staffService.update(member.id, payload);
      setMember(updated);
      setIsEditing(false);
      setToast({ message: 'تم حفظ التعديلات بنجاح', type: 'success' });
    } catch {
      setEditError('فشل في حفظ التعديلات. حاول مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!member || !confirmDialog) return;
    setActionLoading(true);
    try {
      if (confirmDialog === 'deactivate') {
        await staffService.deactivate(member.id);
        setToast({ message: 'تم إلغاء تفعيل الحساب بنجاح', type: 'success' });
      } else {
        await staffService.reactivate(member.id);
        setToast({ message: 'تم إعادة تفعيل الحساب بنجاح', type: 'success' });
      }
      setConfirmDialog(null);
      loadMember();
    } catch {
      setToast({ message: 'حدث خطأ. حاول مرة أخرى.', type: 'error' });
      setConfirmDialog(null);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Loading / Error states ─────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" dir="rtl">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-10 h-10 border-2 border-[#29AAFE] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">جارٍ التحميل...</span>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="flex flex-col items-center gap-4 min-h-[60vh] justify-center" dir="rtl">
        <span className="text-4xl">⚠️</span>
        <p className="text-gray-600 text-sm font-semibold">{error ?? 'الموظف غير موجود'}</p>
        <div className="flex gap-3">
          <button
            onClick={loadMember}
            className="px-4 py-2 bg-[#29AAFE] text-white rounded-xl text-sm font-bold hover:bg-[#1A8FD9] transition-colors"
          >
            إعادة المحاولة
          </button>
          <Link
            href={`/${locale}/clinic/staff`}
            className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
          >
            العودة للطاقم
          </Link>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────

  return (
    <div className="space-y-5 max-w-3xl mx-auto" dir="rtl">
      {/* Back */}
      <Link
        href={`/${locale}/clinic/staff`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#29AAFE] transition-colors font-semibold"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="rotate-180">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        العودة للطاقم الطبي
      </Link>

      {/* Profile card */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-24 w-full" style={{ background: 'linear-gradient(135deg, #29AAFE 0%, #1A8FD9 100%)' }} />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-4">
            <Avatar member={member} />
            <div className="pb-1 flex-1 min-w-0">
              <h1 className="text-xl font-black text-gray-800 truncate">{member.fullName}</h1>
              <p className="text-sm text-gray-500 truncate">{member.email}</p>
            </div>
            <div className="pb-1">
              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                  member.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {member.isActive ? 'نشط' : 'غير نشط'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-sm font-black text-gray-800 mb-5">المعلومات الأساسية</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InfoRow label="البريد الإلكتروني">
            <span className="text-[#29AAFE] font-semibold">{member.email}</span>
          </InfoRow>

          <InfoRow label="رقم الهاتف">
            {member.phoneNumber ?? <span className="text-gray-400">—</span>}
          </InfoRow>

          <InfoRow label="الأدوار">
            {member.roles.length > 0 ? (
              <div className="flex flex-wrap gap-1 mt-0.5">
                {member.roles.map(role => (
                  <span
                    key={role}
                    className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E8F5FF] text-[#29AAFE]"
                  >
                    {role}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-gray-400">—</span>
            )}
          </InfoRow>

          <InfoRow label="الحالة">
            <span
              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                member.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {member.isActive ? 'نشط' : 'غير نشط'}
            </span>
          </InfoRow>

          <InfoRow label="تاريخ الانضمام">
            {fmtDate(member.createdAt)}
          </InfoRow>

          <InfoRow label="آخر دخول">
            {member.lastLoginAt ? fmtDate(member.lastLoginAt) : <span className="text-gray-400">لم يسجل دخول</span>}
          </InfoRow>
        </div>
      </div>

      {/* Edit section */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-black text-gray-800">تعديل البيانات</h2>
          {!isEditing && (
            <button
              onClick={() => {
                setIsEditing(true);
                setEditError(null);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#29AAFE] text-[#29AAFE] text-xs font-bold hover:bg-[#E8F5FF] transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              تعديل
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            {editError && (
              <div className="bg-red-50 text-red-600 text-xs rounded-xl px-3 py-2.5 font-semibold">
                {editError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="الاسم الأول"
                value={editForm.firstName}
                onChange={v => setEditForm(f => ({ ...f, firstName: v }))}
              />
              <Field
                label="الاسم الأخير"
                value={editForm.lastName}
                onChange={v => setEditForm(f => ({ ...f, lastName: v }))}
              />
            </div>
            <Field
              label="رقم الهاتف"
              type="tel"
              value={editForm.phoneNumber}
              onChange={v => setEditForm(f => ({ ...f, phoneNumber: v }))}
            />
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditError(null);
                  setEditForm({
                    firstName: member.firstName,
                    lastName: member.lastName,
                    phoneNumber: member.phoneNumber ?? '',
                  });
                }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#29AAFE] hover:bg-[#1A8FD9] disabled:opacity-60 text-white text-sm font-bold transition-colors"
              >
                {saving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">اضغط على زر &quot;تعديل&quot; لتعديل بيانات الموظف.</p>
        )}
      </div>

      {/* Danger zone */}
      <div className={`rounded-2xl p-6 border-2 ${member.isActive ? 'border-red-200 bg-red-50/30' : 'border-green-200 bg-green-50/30'}`}>
        <h2 className={`text-sm font-black mb-1 ${member.isActive ? 'text-red-700' : 'text-green-700'}`}>
          {member.isActive ? 'منطقة الخطر' : 'إعادة التفعيل'}
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          {member.isActive
            ? 'إلغاء التفعيل سيمنع الموظف من الوصول إلى النظام.'
            : 'إعادة التفعيل ستتيح للموظف الوصول إلى النظام مجدداً.'}
        </p>
        {member.isActive ? (
          <button
            onClick={() => setConfirmDialog('deactivate')}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors"
          >
            إلغاء تفعيل الحساب
          </button>
        ) : (
          <button
            onClick={() => setConfirmDialog('reactivate')}
            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-colors"
          >
            إعادة تفعيل الحساب
          </button>
        )}
      </div>

      {/* Confirm dialog */}
      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog === 'deactivate' ? 'تأكيد إلغاء التفعيل' : 'تأكيد إعادة التفعيل'}
          description={
            confirmDialog === 'deactivate'
              ? `هل أنت متأكد من إلغاء تفعيل حساب "${member.fullName}"؟ لن يتمكن من تسجيل الدخول.`
              : `هل أنت متأكد من إعادة تفعيل حساب "${member.fullName}"؟`
          }
          confirmLabel={confirmDialog === 'deactivate' ? 'إلغاء التفعيل' : 'إعادة التفعيل'}
          confirmCls={confirmDialog === 'deactivate' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
          onConfirm={handleConfirmAction}
          onCancel={() => setConfirmDialog(null)}
          loading={actionLoading}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
