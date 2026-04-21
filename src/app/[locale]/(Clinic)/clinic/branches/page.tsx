'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/services/api-client';
import { getApiError } from '@/shared/utils';

// ── Types ──────────────────────────────────────────────────

interface BranchDto {
  id: string;
  name: string;
  nameArabic?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  isMain: boolean;
  isActive: boolean;
  createdAt: string;
}

interface CreateBranchRequest {
  name: string;
  nameArabic?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  isMain: boolean;
}

interface Wrap<T> {
  success: boolean;
  data: T;
}

// ── API ────────────────────────────────────────────────────

const branchApi = {
  getAll: () =>
    apiClient.get<Wrap<BranchDto[]>>('/api/clinic/branches').then(r => r.data.data),
  create: (d: CreateBranchRequest) =>
    apiClient.post<Wrap<BranchDto>>('/api/clinic/branches', d).then(r => r.data.data),
  update: (id: string, d: Partial<CreateBranchRequest> & { isActive?: boolean }) =>
    apiClient.put<Wrap<BranchDto>>(`/api/clinic/branches/${id}`, d).then(r => r.data.data),
  delete: (id: string) =>
    apiClient.delete(`/api/clinic/branches/${id}`),
};

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
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg text-sm font-bold transition-all ${
        type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      }`}
    >
      <span>{type === 'success' ? '✓' : '✕'}</span>
      <span>{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 mr-1">
        ✕
      </button>
    </div>
  );
}

// ── Field ──────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  error,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1.5">
        {label}
        {required && <span className="text-red-500 mr-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#29AAFE] transition-colors ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-200'
        }`}
        dir="rtl"
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Confirm Dialog ─────────────────────────────────────────

function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  loading,
}: {
  title: string;
  message: string;
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
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 flex flex-col gap-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5 text-red-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <div>
            <p className="font-black text-gray-800 text-sm">{title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-bold transition-colors"
          >
            {loading ? 'جارٍ الحذف...' : 'حذف'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Branch Drawer ──────────────────────────────────────────

type DrawerMode = 'add' | 'edit';

interface DrawerProps {
  mode: DrawerMode;
  branch?: BranchDto;
  onClose: () => void;
  onSaved: () => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

function BranchDrawer({ mode, branch, onClose, onSaved, showToast }: DrawerProps) {
  const [form, setForm] = useState({
    name: branch?.name ?? '',
    nameArabic: branch?.nameArabic ?? '',
    phone: branch?.phone ?? '',
    email: branch?.email ?? '',
    address: branch?.address ?? '',
    city: branch?.city ?? '',
    isMain: branch?.isMain ?? false,
    isActive: branch?.isActive ?? true,
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const validate = (): boolean => {
    const e: Partial<Record<string, string>> = {};
    if (!form.name.trim()) e.name = 'اسم الفرع مطلوب';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'بريد إلكتروني غير صالح';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    setApiError(null);
    try {
      if (mode === 'add') {
        await branchApi.create({
          name: form.name.trim(),
          nameArabic: form.nameArabic.trim() || undefined,
          phone: form.phone.trim() || undefined,
          email: form.email.trim() || undefined,
          address: form.address.trim() || undefined,
          city: form.city.trim() || undefined,
          isMain: form.isMain,
        });
        showToast('تم إضافة الفرع بنجاح', 'success');
      } else {
        await branchApi.update(branch!.id, {
          name: form.name.trim() || undefined,
          nameArabic: form.nameArabic.trim() || undefined,
          phone: form.phone.trim() || undefined,
          email: form.email.trim() || undefined,
          address: form.address.trim() || undefined,
          city: form.city.trim() || undefined,
          isActive: form.isActive,
        });
        showToast('تم تحديث الفرع بنجاح', 'success');
      }
      onSaved();
      onClose();
    } catch (err) {
      setApiError(
        getApiError(err, mode === 'add'
          ? 'فشل في إضافة الفرع. حاول مرة أخرى.'
          : 'فشل في تحديث الفرع. حاول مرة أخرى.')
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <span className="text-base font-black text-gray-800">
            {mode === 'add' ? 'إضافة فرع جديد' : 'تعديل الفرع'}
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {apiError && (
            <div className="bg-red-50 text-red-600 text-xs rounded-xl px-3 py-2.5 font-semibold">
              {apiError}
            </div>
          )}

          <Field
            label="اسم الفرع"
            required
            value={form.name}
            onChange={v => set('name', v)}
            error={errors.name}
            placeholder="مثال: الفرع الرئيسي"
          />

          <Field
            label="الاسم بالعربي"
            value={form.nameArabic}
            onChange={v => set('nameArabic', v)}
            placeholder="الاسم بالعربي (اختياري)"
          />

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="الهاتف"
              type="tel"
              value={form.phone}
              onChange={v => set('phone', v)}
              placeholder="+966 5x xxx xxxx"
            />
            <Field
              label="البريد الإلكتروني"
              type="email"
              value={form.email}
              onChange={v => set('email', v)}
              error={errors.email}
              placeholder="branch@clinic.com"
            />
          </div>

          <Field
            label="العنوان"
            value={form.address}
            onChange={v => set('address', v)}
            placeholder="الشارع، الحي..."
          />

          <Field
            label="المدينة"
            value={form.city}
            onChange={v => set('city', v)}
            placeholder="مثال: الرياض"
          />

          {/* Checkboxes */}
          <div className="space-y-3 pt-1">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={form.isMain}
                  onChange={e => set('isMain', e.target.checked)}
                />
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                    form.isMain
                      ? 'bg-amber-400 border-amber-400'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {form.isMain && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <div>
                <span className="text-sm font-bold text-gray-700">الفرع الرئيسي</span>
                <p className="text-xs text-gray-400">سيتم إلغاء تحديد الفرع الرئيسي الحالي</p>
              </div>
            </label>

            {mode === 'edit' && (
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={form.isActive}
                    onChange={e => set('isActive', e.target.checked)}
                  />
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      form.isActive
                        ? 'bg-[#29AAFE] border-[#29AAFE]'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {form.isActive && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-700">الفرع نشط</span>
              </label>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 flex gap-3 shrink-0">
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
            {saving
              ? 'جارٍ الحفظ...'
              : mode === 'add'
              ? 'إضافة الفرع'
              : 'حفظ التعديلات'}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Branch Card ────────────────────────────────────────────

function BranchCard({
  branch,
  onEdit,
  onDelete,
}: {
  branch: BranchDto;
  onEdit: (b: BranchDto) => void;
  onDelete: (b: BranchDto) => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      {/* Top row: name + badges */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-black text-gray-800 text-base leading-tight truncate">
            {branch.nameArabic || branch.name}
          </p>
          {branch.nameArabic && branch.name !== branch.nameArabic && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{branch.name}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {branch.isMain && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200 whitespace-nowrap">
              الفرع الرئيسي
            </span>
          )}
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${
              branch.isActive
                ? 'bg-green-50 text-green-600'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {branch.isActive ? 'نشط' : 'غير نشط'}
          </span>
        </div>
      </div>

      {/* Info rows */}
      <div className="space-y-2">
        {branch.phone && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg
              className="w-3.5 h-3.5 text-gray-400 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
              />
            </svg>
            <span className="font-mono">{branch.phone}</span>
          </div>
        )}

        {branch.email && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg
              className="w-3.5 h-3.5 text-gray-400 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
            <span className="truncate">{branch.email}</span>
          </div>
        )}

        {(branch.address || branch.city) && (
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <svg
              className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
            <span className="leading-tight">
              {[branch.address, branch.city].filter(Boolean).join('، ')}
            </span>
          </div>
        )}

        {!branch.phone && !branch.email && !branch.address && !branch.city && (
          <p className="text-xs text-gray-400 italic">لا توجد بيانات تواصل</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
        <button
          onClick={() => onEdit(branch)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-[#29AAFE] hover:bg-[#E8F5FF] transition-colors"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
            />
          </svg>
          تعديل
        </button>

        <button
          onClick={() => onDelete(branch)}
          disabled={branch.isMain}
          title={branch.isMain ? 'لا يمكن حذف الفرع الرئيسي' : 'حذف الفرع'}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
          </svg>
          حذف
        </button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────

export default function BranchesPage() {
  useParams(); // keep for locale access if needed

  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Drawer state
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('add');
  const [drawerBranch, setDrawerBranch] = useState<BranchDto | undefined>(undefined);
  const [showDrawer, setShowDrawer] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<BranchDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') =>
    setToast({ message, type });

  const loadBranches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await branchApi.getAll();
      setBranches(data ?? []);
    } catch (err) {
      setError(getApiError(err, 'فشل في تحميل بيانات الفروع. حاول مرة أخرى.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  const handleOpenAdd = () => {
    setDrawerMode('add');
    setDrawerBranch(undefined);
    setShowDrawer(true);
  };

  const handleOpenEdit = (branch: BranchDto) => {
    setDrawerMode('edit');
    setDrawerBranch(branch);
    setShowDrawer(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await branchApi.delete(deleteTarget.id);
      showToast('تم حذف الفرع بنجاح', 'success');
      setDeleteTarget(null);
      loadBranches();
    } catch (err) {
      showToast(getApiError(err, 'فشل في حذف الفرع. حاول مرة أخرى.'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black text-gray-800">الفروع</h1>
          {!loading && (
            <span className="px-2.5 py-0.5 bg-[#E8F5FF] text-[#29AAFE] text-xs font-bold rounded-full">
              {branches.length}
            </span>
          )}
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 bg-[#29AAFE] hover:bg-[#1A8FD9] text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
        >
          <span className="text-base leading-none">+</span>
          إضافة فرع
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#29AAFE] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">جارٍ التحميل...</span>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center px-4">
          <span className="text-3xl">⚠️</span>
          <p className="text-gray-600 text-sm font-semibold">{error}</p>
          <button
            onClick={loadBranches}
            className="px-4 py-2 bg-[#29AAFE] text-white rounded-xl text-sm font-bold hover:bg-[#1A8FD9] transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : branches.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-gray-400">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
              />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-500">لا توجد فروع بعد</p>
            <p className="text-xs text-gray-400 mt-1">ابدأ بإضافة فرع جديد للعيادة</p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 bg-[#29AAFE] hover:bg-[#1A8FD9] text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
          >
            <span className="text-base leading-none">+</span>
            إضافة فرع
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map(branch => (
            <BranchCard
              key={branch.id}
              branch={branch}
              onEdit={handleOpenEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Drawer */}
      {showDrawer && (
        <BranchDrawer
          mode={drawerMode}
          branch={drawerBranch}
          onClose={() => setShowDrawer(false)}
          onSaved={loadBranches}
          showToast={showToast}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmDialog
          title="حذف الفرع"
          message={`هل أنت متأكد من حذف فرع "${deleteTarget.nameArabic || deleteTarget.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
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
