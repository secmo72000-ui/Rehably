'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/services/api-client';
import { getApiError } from '@/shared/utils';

// ── Types ──────────────────────────────────────────────────

interface PermissionDto {
  name: string;
  resource: string;
  action: string;
}

interface RoleDto {
  name: string;
  description?: string | null;
  isCustom: boolean;
  permissions: PermissionDto[];
  createdAt: string;
}

interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: string[];
}

interface UpdateRoleRequest {
  description?: string;
  permissions?: string[];
}

interface Wrap<T> {
  success: boolean;
  data: T;
}

// ── API ────────────────────────────────────────────────────

const rolesApi = {
  getAll: () =>
    apiClient.get<Wrap<RoleDto[]>>('/api/clinic/roles').then((r) => r.data.data),
  getPermissions: () =>
    apiClient
      .get<Wrap<PermissionDto[]>>('/api/clinic/roles/permissions')
      .then((r) => r.data.data),
  create: (data: CreateRoleRequest) =>
    apiClient.post<Wrap<RoleDto>>('/api/clinic/roles', data).then((r) => r.data.data),
  update: (name: string, data: UpdateRoleRequest) =>
    apiClient
      .put<Wrap<RoleDto>>(`/api/clinic/roles/${name}`, data)
      .then((r) => r.data.data),
  delete: (name: string) => apiClient.delete(`/api/clinic/roles/${name}`),
  assignPermission: (roleName: string, perm: string) =>
    apiClient.post(`/api/clinic/roles/${roleName}/permissions/${perm}`),
  removePermission: (roleName: string, perm: string) =>
    apiClient.delete(`/api/clinic/roles/${roleName}/permissions/${perm}`),
  seedDefaults: () =>
    apiClient.post<Wrap<string[]>>('/api/clinic/roles/seed-defaults').then((r) => r.data.data),
};

// ── Resource label map ─────────────────────────────────────

const RESOURCE_LABELS: Record<string, string> = {
  patients:         'المرضى',
  appointments:     'المواعيد',
  'treatment-plans':'خطط العلاج',
  staff:            'فريق العمل',
  billing:          'الفواتير والمدفوعات',
  reports:          'التقارير',
  library:          'المكتبة الطبية',
  settings:         'الإعدادات',
  branches:         'الفروع',
  roles:            'الأدوار والصلاحيات',
  clinics:          'العيادات',
  platform:         'إدارة المنصة',
};

function resourceLabel(resource: string): string {
  return RESOURCE_LABELS[resource] ?? resource;
}

// ── Helpers ────────────────────────────────────────────────

function groupByResource(permissions: PermissionDto[]): Record<string, PermissionDto[]> {
  return permissions.reduce<Record<string, PermissionDto[]>>((acc, p) => {
    if (!acc[p.resource]) acc[p.resource] = [];
    acc[p.resource].push(p);
    return acc;
  }, {});
}

// ── Toast ──────────────────────────────────────────────────

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

function Toast({ message, type, onClose }: ToastState & { onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
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

// ── Confirm Dialog ─────────────────────────────────────────

function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
  loading,
}: {
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
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-gray-800 font-bold text-sm text-center leading-relaxed">{message}</p>
        <div className="flex gap-3 mt-5">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors disabled:opacity-50"
          >
            {loading ? 'جارٍ الحذف...' : 'حذف'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Seed Defaults Modal ────────────────────────────────────

const PRESET_ROLES = [
  {
    name: 'مالك العيادة',
    icon: '👑',
    description: 'صلاحيات كاملة — إدارة الفريق، المرضى، الفواتير، الإعدادات وكل شيء',
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    badgeColor: 'bg-purple-100 text-purple-700',
  },
  {
    name: 'أخصائي أول',
    icon: '🏅',
    description: 'مرضى، مواعيد، خطط علاج، تقارير، مكتبة طبية، عرض الفريق والفواتير',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    name: 'أخصائي علاج طبيعي',
    icon: '🩺',
    description: 'مرضى، مواعيد، خطط علاج، مكتبة طبية — بدون حذف أو إدارة',
    color: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    badgeColor: 'bg-cyan-100 text-cyan-700',
  },
  {
    name: 'مشرف الاستقبال',
    icon: '🗂️',
    description: 'مرضى، مواعيد، فواتير، تقارير، عرض الفريق — إدارة كاملة للاستقبال',
    color: 'bg-green-50 border-green-200 text-green-700',
    badgeColor: 'bg-green-100 text-green-700',
  },
  {
    name: 'موظف استقبال',
    icon: '💁',
    description: 'إضافة المرضى، حجز المواعيد، إنشاء الفواتير وتسجيل المدفوعات',
    color: 'bg-orange-50 border-orange-200 text-orange-700',
    badgeColor: 'bg-orange-100 text-orange-700',
  },
];

function SeedDefaultsModal({
  existingRoleNames,
  onClose,
  onSeeded,
}: {
  existingRoleNames: Set<string>;
  onClose: () => void;
  onSeeded: (created: string[]) => void;
}) {
  const [seeding, setSeeding] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [done, setDone] = useState<string[] | null>(null);

  const allExist = PRESET_ROLES.every((r) => existingRoleNames.has(r.name));

  const handleSeed = async () => {
    setSeeding(true);
    setApiError(null);
    try {
      const created = await rolesApi.seedDefaults();
      setDone(created);
      onSeeded(created);
    } catch (err) {
      setApiError(getApiError(err, 'فشل في تطبيق الأدوار الافتراضية'));
    } finally {
      setSeeding(false);
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
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🎭</span>
            <div>
              <p className="text-base font-black text-gray-800">الأدوار الجاهزة</p>
              <p className="text-xs text-gray-400 mt-0.5">5 أدوار مُعدّة مسبقاً لعيادة العلاج الطبيعي</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {apiError && (
            <div className="bg-red-50 text-red-600 text-xs rounded-xl px-3 py-2.5 font-semibold">
              {apiError}
            </div>
          )}

          {done !== null ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <span className="text-5xl">{done.length === 0 ? '✅' : '🎉'}</span>
              <p className="text-lg font-black text-gray-800">
                {done.length === 0 ? 'الأدوار موجودة بالفعل' : `تم إنشاء ${done.length} ${done.length === 1 ? 'دور' : 'أدوار'}`}
              </p>
              <p className="text-sm text-gray-500">
                {done.length === 0
                  ? 'جميع الأدوار الافتراضية مُضافة مسبقاً'
                  : done.join(' • ')}
              </p>
            </div>
          ) : (
            <>
              {allExist && (
                <div className="flex items-center gap-2 bg-green-50 text-green-700 text-xs font-semibold rounded-xl px-3 py-2.5 mb-1">
                  <span>✓</span>
                  جميع الأدوار الافتراضية مُضافة بالفعل — يمكنك تطبيقها مجدداً بأمان (لن تُكرَّر)
                </div>
              )}
              {PRESET_ROLES.map((role) => {
                const exists = existingRoleNames.has(role.name);
                return (
                  <div
                    key={role.name}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border ${role.color} transition-opacity ${exists ? 'opacity-60' : ''}`}
                  >
                    <span className="text-xl shrink-0 mt-0.5">{role.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black">{role.name}</span>
                        {exists && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${role.badgeColor}`}>
                            موجود
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-0.5 opacity-80 leading-relaxed">{role.description}</p>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors"
          >
            {done !== null ? 'إغلاق' : 'إلغاء'}
          </button>
          {done === null && (
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#29AAFE] hover:bg-[#1A8FD9] disabled:opacity-60 text-white text-sm font-bold transition-colors"
            >
              {seeding && (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
                </svg>
              )}
              {seeding ? 'جارٍ التطبيق...' : 'تطبيق الأدوار الافتراضية'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Create Role Modal ──────────────────────────────────────

function CreateRoleModal({
  availablePermissions,
  onClose,
  onCreated,
}: {
  availablePermissions: PermissionDto[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());
  const [nameError, setNameError] = useState('');
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const grouped = groupByResource(availablePermissions);

  const togglePerm = (permName: string) => {
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      if (next.has(permName)) next.delete(permName);
      else next.add(permName);
      return next;
    });
  };

  const toggleResource = (resource: string) => {
    const perms = grouped[resource] ?? [];
    const allSelected = perms.every((p) => selectedPerms.has(p.name));
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        perms.forEach((p) => next.delete(p.name));
      } else {
        perms.forEach((p) => next.add(p.name));
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setNameError('اسم الدور مطلوب');
      return;
    }
    setNameError('');
    setSaving(true);
    setApiError(null);
    try {
      await rolesApi.create({
        name: name.trim(),
        description: description.trim() || undefined,
        permissions: Array.from(selectedPerms),
      });
      onCreated();
      onClose();
    } catch (err) {
      setApiError(getApiError(err, 'فشل في إنشاء الدور. حاول مرة أخرى.'));
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
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <span className="text-base font-black text-gray-800">إضافة دور جديد</span>
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

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
              اسم الدور <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#29AAFE] transition-colors ${
                nameError ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
              dir="rtl"
              placeholder="مثال: محرر المحتوى"
            />
            {nameError && <p className="mt-1 text-xs text-red-500">{nameError}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">الوصف</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#29AAFE] transition-colors resize-none"
              dir="rtl"
              placeholder="وصف اختياري للدور..."
            />
          </div>

          {/* Permissions */}
          {availablePermissions.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-600 mb-3">الصلاحيات</p>
              <div className="space-y-4">
                {Object.entries(grouped).map(([resource, perms]) => {
                  const allSelected = perms.every((p) => selectedPerms.has(p.name));
                  const someSelected = perms.some((p) => selectedPerms.has(p.name));
                  return (
                    <div key={resource}>
                      <button
                        type="button"
                        onClick={() => toggleResource(resource)}
                        className="flex items-center gap-2 mb-2 group"
                      >
                        <span
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            allSelected
                              ? 'bg-[#29AAFE] border-[#29AAFE]'
                              : someSelected
                              ? 'bg-[#29AAFE]/30 border-[#29AAFE]'
                              : 'border-gray-300 group-hover:border-[#29AAFE]'
                          }`}
                        >
                          {(allSelected || someSelected) && (
                            <svg
                              width="10"
                              height="8"
                              viewBox="0 0 10 8"
                              fill="none"
                            >
                              {allSelected ? (
                                <path
                                  d="M1 4L3.5 6.5L9 1"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              ) : (
                                <rect x="1" y="3.5" width="8" height="1.5" rx="0.75" fill="white" />
                              )}
                            </svg>
                          )}
                        </span>
                        <span className="text-xs font-bold text-gray-700">
                          {resourceLabel(resource)}
                        </span>
                      </button>
                      <div className="flex flex-wrap gap-2 pr-6">
                        {perms.map((perm) => {
                          const active = selectedPerms.has(perm.name);
                          return (
                            <button
                              key={perm.name}
                              type="button"
                              onClick={() => togglePerm(perm.name)}
                              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                                active
                                  ? 'bg-[#29AAFE] border-[#29AAFE] text-white'
                                  : 'border-gray-300 text-gray-500 hover:border-[#29AAFE] hover:text-[#29AAFE]'
                              }`}
                            >
                              {perm.action}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
            {saving ? 'جارٍ الإنشاء...' : 'إنشاء الدور'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Role Detail Panel ──────────────────────────────────────

function RoleDetailPanel({
  role,
  availablePermissions,
  onSaved,
  onDelete,
}: {
  role: RoleDto;
  availablePermissions: PermissionDto[];
  onSaved: (updated: RoleDto) => void;
  onDelete: () => void;
}) {
  const originalNames = new Set(role.permissions.map((p) => p.name));
  const [selected, setSelected] = useState<Set<string>>(new Set(originalNames));
  const [saving, setSaving]     = useState(false);
  const [saveErr, setSaveErr]   = useState<string | null>(null);

  // Re-sync when parent role changes (e.g. after external reload)
  useEffect(() => {
    setSelected(new Set(role.permissions.map((p) => p.name)));
    setSaveErr(null);
  }, [role.name]); // eslint-disable-line react-hooks/exhaustive-deps

  const allPermsForDisplay = availablePermissions.length > 0 ? availablePermissions : role.permissions;
  const grouped            = groupByResource(allPermsForDisplay);

  const isDirty = (() => {
    if (selected.size !== originalNames.size) return true;
    for (const n of selected) if (!originalNames.has(n)) return true;
    return false;
  })();

  const toggle = (name: string) => {
    if (!role.isCustom) return;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const toggleResource = (resource: string) => {
    if (!role.isCustom) return;
    const perms     = grouped[resource] ?? [];
    const allActive = perms.every(p => selected.has(p.name));
    setSelected(prev => {
      const next = new Set(prev);
      if (allActive) perms.forEach(p => next.delete(p.name));
      else           perms.forEach(p => next.add(p.name));
      return next;
    });
  };

  const selectAll  = () => { if (role.isCustom) setSelected(new Set(allPermsForDisplay.map(p => p.name))); };
  const deselectAll = () => { if (role.isCustom) setSelected(new Set()); };
  const discard    = () => { setSelected(new Set(originalNames)); setSaveErr(null); };

  const handleSave = async () => {
    setSaving(true); setSaveErr(null);
    try {
      const updated = await rolesApi.update(role.name, { permissions: Array.from(selected) });
      onSaved(updated);
    } catch (err) {
      setSaveErr(getApiError(err, 'فشل في حفظ الصلاحيات'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Role header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-black text-gray-800 break-all">{role.name}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${role.isCustom ? 'bg-[#E8F5FF] text-[#29AAFE]' : 'bg-gray-100 text-gray-500'}`}>
                {role.isCustom ? 'مخصص' : 'نظام'}
              </span>
            </div>
            {role.description && <p className="mt-1.5 text-sm text-gray-500">{role.description}</p>}
            <p className="mt-1 text-xs text-gray-400">{selected.size} صلاحية محددة</p>
          </div>
          {role.isCustom && (
            <button onClick={onDelete}
              className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
              </svg>
              حذف الدور
            </button>
          )}
        </div>

        {/* Quick-select bar (custom roles only) */}
        {role.isCustom && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <button type="button" onClick={selectAll}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-[#29AAFE]/10 text-[#29AAFE] font-bold hover:bg-[#29AAFE]/20 transition-colors">
              تحديد الكل
            </button>
            <button type="button" onClick={deselectAll}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition-colors">
              إلغاء الكل
            </button>
            {isDirty && (
              <span className="text-[11px] text-amber-600 font-semibold mr-1">● تغييرات غير محفوظة</span>
            )}
          </div>
        )}
      </div>

      {/* Permissions */}
      <div className="flex-1 overflow-y-auto p-6">
        {Object.keys(grouped).length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">لا توجد صلاحيات</p>
        ) : (
          <div className="space-y-5">
            {!role.isCustom && (
              <div className="flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-semibold rounded-xl px-3 py-2.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                هذا دور النظام ولا يمكن تعديل صلاحياته
              </div>
            )}

            {Object.entries(grouped).map(([resource, perms]) => {
              const allActive  = perms.every(p => selected.has(p.name));
              const someActive = perms.some(p => selected.has(p.name));
              return (
                <div key={resource}>
                  {/* Resource header + group toggle */}
                  <div className="flex items-center gap-2 mb-2.5">
                    {role.isCustom && (
                      <button type="button" onClick={() => toggleResource(resource)}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                          allActive ? 'bg-[#29AAFE] border-[#29AAFE]' : someActive ? 'bg-[#29AAFE]/30 border-[#29AAFE]' : 'border-gray-300 hover:border-[#29AAFE]'
                        }`}>
                        {(allActive || someActive) && (
                          <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
                            {allActive
                              ? <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              : <rect x="1" y="3.5" width="8" height="1.5" rx="0.75" fill="white"/>
                            }
                          </svg>
                        )}
                      </button>
                    )}
                    <span className="text-xs font-black text-gray-700">{resourceLabel(resource)}</span>
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-[11px] text-gray-400">{perms.filter(p => selected.has(p.name)).length}/{perms.length}</span>
                  </div>

                  {/* Permission chips */}
                  <div className="flex flex-wrap gap-2 pr-6">
                    {perms.map(perm => {
                      const active = selected.has(perm.name);
                      return (
                        <button key={perm.name} type="button"
                          disabled={!role.isCustom}
                          onClick={() => toggle(perm.name)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            active
                              ? 'bg-[#29AAFE] border-[#29AAFE] text-white shadow-sm'
                              : 'border-gray-200 text-gray-400 bg-white'
                          } ${role.isCustom
                              ? active ? 'hover:bg-[#1A8FD9] cursor-pointer' : 'hover:border-[#29AAFE] hover:text-[#29AAFE] cursor-pointer'
                              : 'cursor-default'
                          }`}>
                          {perm.action}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky save footer — only shown for custom roles */}
      {role.isCustom && (
        <div className={`shrink-0 border-t px-6 py-4 flex items-center gap-3 transition-colors ${isDirty ? 'border-[#29AAFE]/30 bg-[#F0F9FF]' : 'border-gray-100 bg-white'}`}>
          {saveErr && <p className="text-xs text-red-500 font-semibold flex-1">{saveErr}</p>}
          {!saveErr && <p className="text-xs text-gray-400 flex-1">{isDirty ? 'لديك تغييرات غير محفوظة' : 'لا توجد تغييرات'}</p>}
          <button type="button" onClick={discard} disabled={!isDirty || saving}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-500 text-xs font-bold hover:bg-gray-50 disabled:opacity-40 transition-colors">
            تجاهل
          </button>
          <button type="button" onClick={handleSave} disabled={!isDirty || saving}
            className="flex items-center gap-2 bg-[#29AAFE] hover:bg-[#1A8FD9] disabled:opacity-40 text-white font-bold text-xs px-5 py-2 rounded-xl transition-colors">
            {saving && <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/></svg>}
            {saving ? 'جارٍ الحفظ…' : 'حفظ الصلاحيات'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────

export default function RolesPage() {
  useParams();

  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<PermissionDto[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSeedModal, setShowSeedModal] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rolesData, permsData] = await Promise.all([
        rolesApi.getAll(),
        rolesApi.getPermissions(),
      ]);
      setRoles(rolesData);
      setAvailablePermissions(permsData);
      // Keep selected role in sync
      if (selectedRole) {
        const updated = rolesData.find((r) => r.name === selectedRole.name);
        setSelectedRole(updated ?? null);
      }
    } catch (err) {
      setError(getApiError(err, 'فشل في تحميل البيانات. حاول مرة أخرى.'));
    } finally {
      setLoading(false);
    }
  }, [selectedRole]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePermsSaved = (updated: RoleDto) => {
    setSelectedRole(updated);
    setRoles(prev => prev.map(r => r.name === updated.name ? updated : r));
    showToast('تم حفظ الصلاحيات بنجاح', 'success');
  };

  const handleDelete = async () => {
    if (!selectedRole) return;
    setDeleting(true);
    try {
      await rolesApi.delete(selectedRole.name);
      showToast('تم حذف الدور بنجاح', 'success');
      setSelectedRole(null);
      setConfirmDelete(false);
      await loadData();
    } catch (err) {
      showToast(getApiError(err, 'فشل في حذف الدور. حاول مرة أخرى.'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleCreated = async () => {
    showToast('تم إنشاء الدور بنجاح', 'success');
    await loadData();
  };

  const handleSeeded = async (created: string[]) => {
    await loadData();
    if (created.length === 0) {
      showToast('الأدوار الافتراضية موجودة بالفعل', 'success');
    } else {
      showToast(`تم إنشاء ${created.length} ${created.length === 1 ? 'دور' : 'أدوار'} جديدة`, 'success');
    }
  };

  return (
    <div className="space-y-5" dir="rtl">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black text-gray-800">الأدوار والصلاحيات</h1>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <div className="w-8 h-8 border-2 border-[#29AAFE] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">جارٍ التحميل...</span>
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center gap-3 py-16 text-center px-4">
          <span className="text-3xl">⚠️</span>
          <p className="text-gray-600 text-sm font-semibold">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-[#29AAFE] text-white rounded-xl text-sm font-bold hover:bg-[#1A8FD9] transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Two-panel layout */}
      {!loading && !error && (
        <div className="flex gap-5 items-start min-h-[calc(100vh-180px)]">
          {/* Left panel — Role list */}
          <div className="w-1/3 shrink-0 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-gray-800">الأدوار</span>
                <span className="px-2 py-0.5 bg-[#E8F5FF] text-[#29AAFE] text-xs font-bold rounded-full">
                  {roles.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSeedModal(true)}
                  className="flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-purple-200 transition-colors"
                  title="تطبيق أدوار افتراضية جاهزة"
                >
                  🎭 أدوار جاهزة
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-1 bg-[#29AAFE] hover:bg-[#1A8FD9] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
                >
                  <span className="text-sm leading-none">+</span>
                  إضافة دور
                </button>
              </div>
            </div>

            {/* Role list */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {roles.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
                  <span className="text-3xl">🔐</span>
                  <p className="text-xs font-semibold">لا توجد أدوار</p>
                </div>
              ) : (
                roles.map((role) => {
                  const isSelected = selectedRole?.name === role.name;
                  return (
                    <button
                      key={role.name}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`w-full text-right px-4 py-3.5 transition-colors flex items-center justify-between gap-3 group ${
                        isSelected
                          ? 'bg-[#E8F5FF] border-r-2 border-[#29AAFE]'
                          : 'hover:bg-gray-50 border-r-2 border-transparent'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-sm font-bold truncate ${
                              isSelected ? 'text-[#29AAFE]' : 'text-gray-800'
                            }`}
                          >
                            {role.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              role.isCustom
                                ? 'bg-[#E8F5FF] text-[#29AAFE]'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {role.isCustom ? 'مخصص' : 'نظام'}
                          </span>
                        </div>
                        {role.description && (
                          <p className="mt-0.5 text-xs text-gray-400 truncate">{role.description}</p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-bold ${
                          isSelected
                            ? 'bg-[#29AAFE] text-white'
                            : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                        }`}
                      >
                        {role.permissions.length}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right panel — Role detail */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm overflow-hidden min-h-[500px]">
            {selectedRole ? (
              <RoleDetailPanel
                role={selectedRole}
                availablePermissions={availablePermissions}
                onSaved={handlePermsSaved}
                onDelete={() => setConfirmDelete(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4 py-24 text-gray-300">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <p className="text-sm font-semibold">اختر دوراً لعرض صلاحياته</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Seed Defaults Modal */}
      {showSeedModal && (
        <SeedDefaultsModal
          existingRoleNames={new Set(roles.map((r) => r.name))}
          onClose={() => setShowSeedModal(false)}
          onSeeded={handleSeeded}
        />
      )}

      {/* Create Role Modal */}
      {showCreateModal && (
        <CreateRoleModal
          availablePermissions={availablePermissions}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}

      {/* Delete confirm */}
      {confirmDelete && selectedRole && (
        <ConfirmDialog
          message={`هل أنت متأكد من حذف دور "${selectedRole.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
          loading={deleting}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
