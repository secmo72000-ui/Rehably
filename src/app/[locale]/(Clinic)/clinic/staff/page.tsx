'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { staffService } from '@/domains/staff/staff.service';
import type { StaffMember, InviteStaffRequest } from '@/domains/staff/staff.types';

// ── Helpers ────────────────────────────────────────────────

function fmtDate(iso?: string | null): string {
  if (!iso) return 'لم يسجل دخول';
  return new Date(iso).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getInitials(member: StaffMember): string {
  return ((member.firstName?.[0] ?? '') + (member.lastName?.[0] ?? '')).toUpperCase();
}

// ── Toast ──────────────────────────────────────────────────

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg text-sm font-bold transition-all ${
        type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      }`}
    >
      <span>{type === 'success' ? '✓' : '✕'}</span>
      <span>{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 mr-1">✕</button>
    </div>
  );
}

// ── Field ──────────────────────────────────────────────────

function Field({
  label, value, onChange, type = 'text', required = false, error,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; error?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1.5">
        {label}{required && <span className="text-red-500 mr-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#29AAFE] transition-colors ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-200'
        }`}
        dir="rtl"
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── RoleSelect ─────────────────────────────────────────────

const STAFF_ROLES = [
  { value: 'Doctor',       label: 'طبيب / معالج' },
  { value: 'Receptionist', label: 'موظف استقبال' },
  { value: 'User',         label: 'موظف عام' },
];

function RoleSelect({
  value, onChange, required = false, error,
}: {
  value: string; onChange: (v: string) => void; required?: boolean; error?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1.5">
        الدور{required && <span className="text-red-500 mr-0.5">*</span>}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#29AAFE] transition-colors bg-white ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-200'
        }`}
        dir="rtl"
      >
        <option value="">-- اختر الدور --</option>
        {STAFF_ROLES.map(r => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Avatar ─────────────────────────────────────────────────

function Avatar({ member, size = 'sm' }: { member: StaffMember; size?: 'sm' | 'lg' }) {
  const sz = size === 'sm' ? 'w-9 h-9 text-sm' : 'w-16 h-16 text-xl';
  if (member.profileImageUrl) {
    return (
      <img
        src={member.profileImageUrl}
        alt={member.fullName}
        className={`${sz} rounded-full object-cover shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center text-white font-bold shrink-0`}
      style={{ background: 'linear-gradient(135deg, #29AAFE, #1A8FD9)' }}
    >
      {getInitials(member)}
    </div>
  );
}

// ── Invite Modal ───────────────────────────────────────────

function InviteModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<InviteStaffRequest>({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof InviteStaffRequest, string>>>({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const set = (k: keyof InviteStaffRequest, v: string) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const validate = (): boolean => {
    const e: Partial<Record<keyof InviteStaffRequest, string>> = {};
    if (!form.firstName.trim()) e.firstName = 'الاسم الأول مطلوب';
    if (!form.lastName.trim()) e.lastName = 'الاسم الأخير مطلوب';
    if (!form.email.trim()) e.email = 'البريد الإلكتروني مطلوب';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'بريد إلكتروني غير صالح';
    if (!form.role.trim()) e.role = 'الدور مطلوب';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    setApiError(null);
    try {
      await staffService.invite({
        ...form,
        phoneNumber: form.phoneNumber || undefined,
      });
      onSaved();
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string }; message?: string; title?: string } }; message?: string };
      const msg =
        axiosErr?.response?.data?.error?.message ||
        axiosErr?.response?.data?.message ||
        axiosErr?.response?.data?.title ||
        axiosErr?.message ||
        'فشل في إرسال الدعوة. حاول مرة أخرى.';
      setApiError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <span className="text-base font-black text-gray-800">دعوة موظف جديد</span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {apiError && (
            <div className="bg-red-50 text-red-600 text-xs rounded-xl px-3 py-2.5 font-semibold">
              {apiError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="الاسم الأول"
              required
              value={form.firstName}
              onChange={v => set('firstName', v)}
              error={errors.firstName}
            />
            <Field
              label="الاسم الأخير"
              required
              value={form.lastName}
              onChange={v => set('lastName', v)}
              error={errors.lastName}
            />
          </div>
          <Field
            label="البريد الإلكتروني"
            required
            type="email"
            value={form.email}
            onChange={v => set('email', v)}
            error={errors.email}
          />
          <Field
            label="رقم الهاتف"
            type="tel"
            value={form.phoneNumber ?? ''}
            onChange={v => set('phoneNumber', v)}
          />
          <RoleSelect
            value={form.role}
            onChange={v => set('role', v)}
            required
            error={errors.role}
          />
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-[#29AAFE] hover:bg-[#1A8FD9] disabled:opacity-60 text-white text-sm font-bold transition-colors"
          >
            {saving ? 'جارٍ الإرسال...' : 'إرسال الدعوة'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────

type StatusFilter = 'all' | 'active' | 'inactive';

export default function StaffPage() {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'ar';

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const loadStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await staffService.getAll({
        search: debouncedSearch || undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
        page,
        pageSize,
      });
      setStaff(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch {
      setError('فشل في تحميل بيانات الطاقم. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, page]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const handleToggleActive = async (member: StaffMember) => {
    setActionLoading(member.id);
    try {
      if (member.isActive) {
        await staffService.deactivate(member.id);
        setToast({ message: 'تم إلغاء تفعيل الحساب بنجاح', type: 'success' });
      } else {
        await staffService.reactivate(member.id);
        setToast({ message: 'تم إعادة تفعيل الحساب بنجاح', type: 'success' });
      }
      loadStaff();
    } catch {
      setToast({ message: 'حدث خطأ. حاول مرة أخرى.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const statusPills: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: 'الكل' },
    { id: 'active', label: 'نشط' },
    { id: 'inactive', label: 'غير نشط' },
  ];

  return (
    <div className="space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black text-gray-800">الطاقم الطبي</h1>
          {!loading && (
            <span className="px-2.5 py-0.5 bg-[#E8F5FF] text-[#29AAFE] text-xs font-bold rounded-full">
              {totalCount}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-1.5 bg-[#29AAFE] hover:bg-[#1A8FD9] text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
        >
          <span className="text-base leading-none">+</span>
          دعوة موظف جديد
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 min-w-[220px] flex-1 max-w-sm">
          <svg className="text-gray-400 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو البريد..."
            className="bg-transparent border-none outline-none text-sm w-full text-right"
            dir="rtl"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
          )}
        </div>

        {/* Status pills */}
        <div className="flex gap-1.5">
          {statusPills.map(pill => (
            <button
              key={pill.id}
              onClick={() => { setStatusFilter(pill.id); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                statusFilter === pill.id
                  ? 'bg-[#29AAFE] text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#29AAFE] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">جارٍ التحميل...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center px-4">
            <span className="text-3xl">⚠️</span>
            <p className="text-gray-600 text-sm font-semibold">{error}</p>
            <button
              onClick={loadStaff}
              className="px-4 py-2 bg-[#29AAFE] text-white rounded-xl text-sm font-bold hover:bg-[#1A8FD9] transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : staff.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
            <span className="text-4xl">👥</span>
            <p className="text-sm font-semibold">لا يوجد موظفون مطابقون</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" dir="rtl">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['الموظف', 'البريد الإلكتروني', 'الهاتف', 'الأدوار', 'الحالة', 'آخر دخول', 'إجراءات'].map(h => (
                    <th key={h} className="px-4 py-3 text-right text-xs font-bold text-gray-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staff.map(member => (
                  <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                    {/* Name + Avatar */}
                    <td className="px-4 py-3">
                      <Link
                        href={`/${locale}/clinic/staff/${member.id}`}
                        className="flex items-center gap-3 group-hover:opacity-90"
                      >
                        <Avatar member={member} />
                        <span className="font-bold text-gray-800 whitespace-nowrap hover:text-[#29AAFE] transition-colors">
                          {member.fullName}
                        </span>
                      </Link>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {member.email}
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap font-mono">
                      {member.phoneNumber ?? '—'}
                    </td>

                    {/* Roles */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {member.roles.length > 0 ? (
                          member.roles.map(role => (
                            <span
                              key={role}
                              className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-[#E8F5FF] text-[#29AAFE]"
                            >
                              {role}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          member.isActive
                            ? 'bg-green-50 text-green-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {member.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>

                    {/* Last login */}
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {fmtDate(member.lastLoginAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/${locale}/clinic/staff/${member.id}`}
                          className="text-[#29AAFE] text-xs font-bold hover:underline whitespace-nowrap"
                        >
                          عرض
                        </Link>
                        <button
                          onClick={() => handleToggleActive(member)}
                          disabled={actionLoading === member.id}
                          className={`text-xs font-bold hover:underline whitespace-nowrap transition-colors disabled:opacity-50 ${
                            member.isActive
                              ? 'text-red-400 hover:text-red-600'
                              : 'text-green-500 hover:text-green-700'
                          }`}
                        >
                          {actionLoading === member.id
                            ? '...'
                            : member.isActive
                            ? 'إلغاء'
                            : 'تفعيل'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            السابق
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
              .reduce<(number | 'ellipsis')[]>((acc, n, idx, arr) => {
                if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                acc.push(n);
                return acc;
              }, [])
              .map((item, idx) =>
                item === 'ellipsis' ? (
                  <span key={`e-${idx}`} className="px-2 py-1.5 text-xs text-gray-400">
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item as number)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors ${
                      page === item
                        ? 'bg-[#29AAFE] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            التالي
          </button>
        </div>
      )}

      {/* Modals */}
      {showInviteModal && (
        <InviteModal
          onClose={() => setShowInviteModal(false)}
          onSaved={() => {
            setToast({ message: 'تم إرسال الدعوة بنجاح', type: 'success' });
            loadStaff();
          }}
        />
      )}

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
