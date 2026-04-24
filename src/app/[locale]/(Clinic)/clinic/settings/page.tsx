'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiClient } from '@/services/api-client';
import { getApiError } from '@/shared/utils';
import {
  loadServices, saveServices, newServiceId, EMPTY_SERVICE, BACKEND_TYPE_LABELS,
  type ClinicService,
} from '@/shared/utils/clinicServices';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClinicProfile {
  clinicName: string;
  description: string;
  specialty: string;
  address: string;
  city: string;
  region: string;
  phone: string;
  fax: string;
  email: string;
  website: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

type SettingsTab = 'clinic' | 'contact' | 'services';

// ─── Service color palette ────────────────────────────────────────────────────

const COLOR_PALETTE = [
  '#29AAFE', '#10b981', '#f59e0b', '#8b5cf6',
  '#ef4444', '#ec4899', '#14b8a6', '#f97316',
  '#6366f1', '#84cc16',
];

function fmtDuration(min: number): string {
  if (min < 60) return `${min} دقيقة`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} ساعة و${m} دقيقة` : `${h} ساعة`;
}

const EMPTY_PROFILE: ClinicProfile = {
  clinicName: '',
  description: '',
  specialty: '',
  address: '',
  city: '',
  region: '',
  phone: '',
  fax: '',
  email: '',
  website: '',
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function FieldSkeleton() {
  return (
    <div className="space-y-1.5">
      <div className="h-3.5 w-24 bg-gray-200 rounded animate-pulse" />
      <div className="h-10 w-full bg-gray-100 rounded-xl animate-pulse" />
    </div>
  );
}

function FormSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: rows }).map((_, i) => (
        <FieldSkeleton key={i} />
      ))}
      <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse" />
    </div>
  );
}

// ─── Reusable field components ─────────────────────────────────────────────────

interface InputFieldProps {
  label: string;
  name: keyof ClinicProfile;
  type?: React.HTMLInputTypeAttribute;
  value: string;
  onChange: (name: keyof ClinicProfile, value: string) => void;
  disabled?: boolean;
}

function InputField({ label, name, type = 'text', value, onChange, disabled }: InputFieldProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-bold text-gray-600 mb-1.5">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={e => onChange(name, e.target.value)}
        disabled={disabled}
        dir="rtl"
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none
                   focus:border-[#29AAFE] focus:ring-2 focus:ring-[#29AAFE]/20 transition-all
                   disabled:bg-gray-50 disabled:text-gray-400"
      />
    </div>
  );
}

interface TextareaFieldProps {
  label: string;
  name: keyof ClinicProfile;
  value: string;
  onChange: (name: keyof ClinicProfile, value: string) => void;
  disabled?: boolean;
}

function TextareaField({ label, name, value, onChange, disabled }: TextareaFieldProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-bold text-gray-600 mb-1.5">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={e => onChange(name, e.target.value)}
        disabled={disabled}
        rows={4}
        dir="rtl"
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none
                   focus:border-[#29AAFE] focus:ring-2 focus:ring-[#29AAFE]/20 transition-all
                   disabled:bg-gray-50 disabled:text-gray-400 resize-none"
      />
    </div>
  );
}

// ─── Toast ─────────────────────────────────────────────────────────────────────

interface ToastProps {
  type: 'success' | 'error';
  message: string;
}

function Toast({ type, message }: ToastProps) {
  const isSuccess = type === 'success';
  return (
    <div
      role="alert"
      dir="rtl"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5
                  px-5 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all
                  ${isSuccess
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
    >
      <span className="text-base">{isSuccess ? '✓' : '✕'}</span>
      {message}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';

  const [activeTab, setActiveTab] = useState<SettingsTab>('clinic');
  const [profile, setProfile] = useState<ClinicProfile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastProps | null>(null);

  // ── Clinic services state ──────────────────────────────────────────────────
  const [services, setServices] = useState<ClinicService[]>([]);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editForm,  setEditForm]    = useState<ClinicService | null>(null);
  const [addingNew, setAddingNew]   = useState(false);
  const [newForm,   setNewForm]     = useState<ClinicService>({ id: '', ...EMPTY_SERVICE });

  useEffect(() => { setServices(loadServices()); }, []);

  // ── Load profile on mount ──────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      try {
        const res = await apiClient.get<ApiResponse<ClinicProfile>>('/api/clinic/profile');
        if (!cancelled) {
          setProfile({ ...EMPTY_PROFILE, ...res.data.data });
        }
      } catch (err) {
        if (!cancelled) {
          showToast('error', getApiError(err, 'تعذّر تحميل بيانات العيادة. يرجى المحاولة مرة أخرى.'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProfile();
    return () => { cancelled = true; };
  }, []);

  // ── Toast helpers ──────────────────────────────────────────────────────────

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Field change handler ───────────────────────────────────────────────────

  const handleChange = (name: keyof ClinicProfile, value: string) => {
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // ── Save handler ───────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put<ApiResponse<ClinicProfile>>('/api/clinic/profile', profile);
      showToast('success', 'تم حفظ البيانات بنجاح');
    } catch (err) {
      showToast('error', getApiError(err, 'حدث خطأ أثناء الحفظ. يرجى المحاولة مرة أخرى.'));
    } finally {
      setSaving(false);
    }
  };

  // ── Clinic services CRUD ──────────────────────────────────────────────────

  const persistServices = (updated: ClinicService[]) => {
    saveServices(updated);
    setServices(updated);
  };

  const handleAddService = () => {
    if (!newForm.nameArabic.trim()) return;
    const svc: ClinicService = { ...newForm, id: newServiceId() };
    persistServices([...services, svc]);
    setAddingNew(false);
    setNewForm({ id: '', ...EMPTY_SERVICE });
    showToast('success', 'تمت إضافة الخدمة');
  };

  const handleSaveEdit = () => {
    if (!editForm || !editForm.nameArabic.trim()) return;
    persistServices(services.map(s => s.id === editForm.id ? editForm : s));
    setEditingId(null);
    setEditForm(null);
    showToast('success', 'تم حفظ التعديلات');
  };

  const handleDeleteService = (id: string) => {
    persistServices(services.filter(s => s.id !== id));
    if (editingId === id) { setEditingId(null); setEditForm(null); }
    showToast('success', 'تم حذف الخدمة');
  };

  const handleToggleActive = (id: string) => {
    persistServices(services.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  const startEdit = (svc: ClinicService) => {
    setEditingId(svc.id);
    setEditForm({ ...svc });
    setAddingNew(false);
  };

  // ── Tab definitions ────────────────────────────────────────────────────────

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'clinic',   label: 'معلومات العيادة' },
    { id: 'contact',  label: 'معلومات الاتصال' },
    { id: 'services', label: 'خدمات العيادة' },
  ];

  // ── Save button ────────────────────────────────────────────────────────────

  const SaveButton = () => (
    <button
      type="button"
      onClick={handleSave}
      disabled={saving || loading}
      className="inline-flex items-center gap-2 bg-[#29AAFE] hover:bg-[#1A8FD9] active:bg-[#1580C5]
                 disabled:opacity-50 disabled:cursor-not-allowed
                 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-colors shadow-sm"
    >
      {saving && (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
        </svg>
      )}
      {saving ? 'جارٍ الحفظ…' : 'حفظ التغييرات'}
    </button>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5" dir="rtl">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-gray-800">الإعدادات</h1>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

        {/* Tabs */}
        <div className="flex gap-1 border-b-2 border-gray-200 px-5 pt-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs font-bold transition-all border-b-2 -mb-[2px] whitespace-nowrap
                ${activeTab === tab.id
                  ? 'text-[#29AAFE] border-[#29AAFE]'
                  : 'text-gray-400 border-transparent hover:text-gray-600'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6">

          {/* ── Tab 1: Clinic Info ─────────────────────────────────────────── */}
          {activeTab === 'clinic' && (
            loading
              ? <FormSkeleton rows={6} />
              : (
                <div className="space-y-5 max-w-2xl">
                  <InputField
                    label="اسم العيادة"
                    name="clinicName"
                    value={profile.clinicName}
                    onChange={handleChange}
                  />
                  <TextareaField
                    label="الوصف"
                    name="description"
                    value={profile.description}
                    onChange={handleChange}
                  />
                  <InputField
                    label="التخصص"
                    name="specialty"
                    value={profile.specialty}
                    onChange={handleChange}
                  />
                  <InputField
                    label="عنوان العيادة"
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InputField
                      label="المدينة"
                      name="city"
                      value={profile.city}
                      onChange={handleChange}
                    />
                    <InputField
                      label="المنطقة / المحافظة"
                      name="region"
                      value={profile.region}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="pt-2">
                    <SaveButton />
                  </div>
                </div>
              )
          )}

          {/* ── Tab 2: Contact Info ────────────────────────────────────────── */}
          {activeTab === 'contact' && (
            loading
              ? <FormSkeleton rows={4} />
              : (
                <div className="space-y-5 max-w-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InputField
                      label="رقم الهاتف"
                      name="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={handleChange}
                    />
                    <InputField
                      label="رقم الفاكس"
                      name="fax"
                      type="tel"
                      value={profile.fax}
                      onChange={handleChange}
                    />
                  </div>
                  <InputField
                    label="البريد الإلكتروني"
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleChange}
                  />
                  <InputField
                    label="الموقع الإلكتروني"
                    name="website"
                    type="url"
                    value={profile.website}
                    onChange={handleChange}
                  />
                  <div className="pt-2">
                    <SaveButton />
                  </div>
                </div>
              )
          )}

          {/* ── Tab 3: Clinic Services ────────────────────────────────────── */}
          {activeTab === 'services' && (
            <div className="space-y-5 max-w-2xl">

              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-700">خدمات العيادة</h3>
                  <p className="text-xs text-gray-400 mt-0.5">الخدمات المتاحة في المواعيد والفواتير — تُحفظ محلياً على هذا الجهاز</p>
                </div>
                {!addingNew && (
                  <button
                    type="button"
                    onClick={() => { setAddingNew(true); setEditingId(null); setEditForm(null); setNewForm({ id: '', ...EMPTY_SERVICE }); }}
                    className="flex items-center gap-1.5 bg-[#29AAFE] hover:bg-[#1A8FD9] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors"
                  >
                    <span className="text-base leading-none">+</span> خدمة جديدة
                  </button>
                )}
              </div>

              {/* ── Add new service form ──────────────────────────────── */}
              {addingNew && (
                <div className="border-2 border-[#29AAFE]/40 rounded-2xl p-4 bg-[#F0F9FF] space-y-3">
                  <div className="text-xs font-bold text-[#29AAFE] mb-1">إضافة خدمة جديدة</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">الاسم بالعربية *</label>
                      <input type="text" value={newForm.nameArabic}
                        onChange={e => setNewForm(f => ({ ...f, nameArabic: e.target.value }))}
                        placeholder="مثال: علاج طبيعي"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#29AAFE] focus:ring-2 focus:ring-[#29AAFE]/10"
                        dir="rtl" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">الاسم بالإنجليزية</label>
                      <input type="text" value={newForm.nameEnglish}
                        onChange={e => setNewForm(f => ({ ...f, nameEnglish: e.target.value }))}
                        placeholder="e.g. Physical Therapy"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#29AAFE] focus:ring-2 focus:ring-[#29AAFE]/10"
                        dir="ltr" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">المدة (دقيقة)</label>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => setNewForm(f => ({ ...f, duration: Math.max(5, f.duration - 5) }))}
                          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 font-bold shrink-0">−</button>
                        <input type="number" min={5} max={480} step={5} value={newForm.duration}
                          onChange={e => setNewForm(f => ({ ...f, duration: Math.max(5, Math.min(480, Number(e.target.value) || 5)) }))}
                          className="flex-1 text-center border border-gray-200 rounded-lg py-1.5 text-sm font-bold outline-none focus:border-[#29AAFE]"
                          dir="ltr" />
                        <button type="button" onClick={() => setNewForm(f => ({ ...f, duration: Math.min(480, f.duration + 5) }))}
                          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 font-bold shrink-0">+</button>
                      </div>
                      <div className="text-[11px] text-[#29AAFE] font-bold mt-1">{fmtDuration(newForm.duration)}</div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">السعر (ج.م)</label>
                      <input type="number" min={0} step={10} value={newForm.price || ''}
                        onChange={e => setNewForm(f => ({ ...f, price: Math.max(0, Number(e.target.value) || 0) }))}
                        placeholder="0"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#29AAFE] focus:ring-2 focus:ring-[#29AAFE]/10"
                        dir="ltr" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">النوع</label>
                      <select value={newForm.backendType}
                        onChange={e => setNewForm(f => ({ ...f, backendType: Number(e.target.value) }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#29AAFE] bg-white">
                        {Object.entries(BACKEND_TYPE_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {/* Color picker */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5">اللون</label>
                    <div className="flex gap-2 flex-wrap">
                      {COLOR_PALETTE.map(c => (
                        <button key={c} type="button" title={c}
                          onClick={() => setNewForm(f => ({ ...f, color: c }))}
                          style={{ backgroundColor: c }}
                          className={`w-7 h-7 rounded-lg transition-all ${newForm.color === c ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : 'hover:scale-105'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={handleAddService}
                      disabled={!newForm.nameArabic.trim()}
                      className="flex-1 bg-[#29AAFE] hover:bg-[#1A8FD9] disabled:opacity-40 text-white font-bold text-sm py-2 rounded-xl transition-colors">
                      إضافة الخدمة
                    </button>
                    <button type="button" onClick={() => setAddingNew(false)}
                      className="px-4 py-2 border border-gray-200 text-sm text-gray-500 font-semibold rounded-xl hover:bg-gray-50">
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              {/* ── Services list ─────────────────────────────────────── */}
              {services.length === 0 && !addingNew && (
                <div className="text-center py-10 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-2xl">
                  لا توجد خدمات — اضغط &quot;خدمة جديدة&quot; للبدء
                </div>
              )}
              <div className="space-y-2">
                {services.map(svc => (
                  <div key={svc.id} className={`border rounded-2xl transition-all ${editingId === svc.id ? 'border-[#29AAFE]/50 bg-[#F0F9FF]' : 'border-gray-200 bg-white hover:border-gray-300'}`}>

                    {/* ── Collapsed row ── */}
                    {editingId !== svc.id && (
                      <div className="flex items-center gap-3 px-4 py-3">
                        {/* Color dot */}
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: svc.color }} />
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-800">{svc.nameArabic}</span>
                            {svc.nameEnglish && <span className="text-xs text-gray-400">— {svc.nameEnglish}</span>}
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${svc.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                              {svc.isActive ? 'نشطة' : 'معطلة'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[11px] text-gray-400">{fmtDuration(svc.duration)}</span>
                            <span className="text-[11px] text-gray-300">·</span>
                            <span className={`text-[11px] font-semibold ${svc.price > 0 ? 'text-green-600' : 'text-gray-300'}`}>
                              {svc.price > 0 ? `${svc.price.toLocaleString('ar-EG')} ج.م` : 'بدون سعر'}
                            </span>
                            <span className="text-[11px] text-gray-300">·</span>
                            <span className="text-[11px] text-gray-400">{BACKEND_TYPE_LABELS[svc.backendType]}</span>
                          </div>
                        </div>
                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button type="button" onClick={() => handleToggleActive(svc.id)} title={svc.isActive ? 'تعطيل' : 'تفعيل'}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${svc.isActive ? 'bg-green-50 hover:bg-green-100 text-green-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-400'}`}>
                            {svc.isActive ? '✓' : '○'}
                          </button>
                          <button type="button" onClick={() => startEdit(svc)} title="تعديل"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm bg-blue-50 hover:bg-blue-100 text-blue-500 transition-colors">
                            ✎
                          </button>
                          <button type="button" onClick={() => handleDeleteService(svc.id)} title="حذف"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm bg-red-50 hover:bg-red-100 text-red-500 transition-colors">
                            ✕
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ── Expanded edit form ── */}
                    {editingId === svc.id && editForm && (
                      <div className="p-4 space-y-3">
                        <div className="text-xs font-bold text-[#29AAFE] mb-1">تعديل الخدمة</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 mb-1">الاسم بالعربية *</label>
                            <input type="text" value={editForm.nameArabic}
                              onChange={e => setEditForm(f => f ? { ...f, nameArabic: e.target.value } : f)}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#29AAFE] focus:ring-2 focus:ring-[#29AAFE]/10"
                              dir="rtl" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 mb-1">الاسم بالإنجليزية</label>
                            <input type="text" value={editForm.nameEnglish}
                              onChange={e => setEditForm(f => f ? { ...f, nameEnglish: e.target.value } : f)}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#29AAFE] focus:ring-2 focus:ring-[#29AAFE]/10"
                              dir="ltr" />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 mb-1">المدة (دقيقة)</label>
                            <div className="flex items-center gap-1">
                              <button type="button" onClick={() => setEditForm(f => f ? { ...f, duration: Math.max(5, f.duration - 5) } : f)}
                                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 font-bold shrink-0">−</button>
                              <input type="number" min={5} max={480} step={5} value={editForm.duration}
                                onChange={e => setEditForm(f => f ? { ...f, duration: Math.max(5, Math.min(480, Number(e.target.value) || 5)) } : f)}
                                className="flex-1 text-center border border-gray-200 rounded-lg py-1.5 text-sm font-bold outline-none focus:border-[#29AAFE]"
                                dir="ltr" />
                              <button type="button" onClick={() => setEditForm(f => f ? { ...f, duration: Math.min(480, f.duration + 5) } : f)}
                                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 font-bold shrink-0">+</button>
                            </div>
                            <div className="text-[11px] text-[#29AAFE] font-bold mt-1">{fmtDuration(editForm.duration)}</div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 mb-1">السعر (ج.م)</label>
                            <input type="number" min={0} step={10} value={editForm.price || ''}
                              onChange={e => setEditForm(f => f ? { ...f, price: Math.max(0, Number(e.target.value) || 0) } : f)}
                              placeholder="0"
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#29AAFE] focus:ring-2 focus:ring-[#29AAFE]/10"
                              dir="ltr" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 mb-1">النوع</label>
                            <select value={editForm.backendType}
                              onChange={e => setEditForm(f => f ? { ...f, backendType: Number(e.target.value) } : f)}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#29AAFE] bg-white">
                              {Object.entries(BACKEND_TYPE_LABELS).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        {/* Color picker */}
                        <div>
                          <label className="block text-[11px] font-bold text-gray-500 mb-1.5">اللون</label>
                          <div className="flex gap-2 flex-wrap">
                            {COLOR_PALETTE.map(c => (
                              <button key={c} type="button" title={c}
                                onClick={() => setEditForm(f => f ? { ...f, color: c } : f)}
                                style={{ backgroundColor: c }}
                                className={`w-7 h-7 rounded-lg transition-all ${editForm.color === c ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : 'hover:scale-105'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button type="button" onClick={handleSaveEdit}
                            disabled={!editForm.nameArabic.trim()}
                            className="flex-1 bg-[#29AAFE] hover:bg-[#1A8FD9] disabled:opacity-40 text-white font-bold text-sm py-2 rounded-xl transition-colors">
                            حفظ التعديلات
                          </button>
                          <button type="button" onClick={() => { setEditingId(null); setEditForm(null); }}
                            className="px-4 py-2 border border-gray-200 text-sm text-gray-500 font-semibold rounded-xl hover:bg-gray-50">
                            إلغاء
                          </button>
                          <button type="button" onClick={() => handleDeleteService(svc.id)}
                            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-500 text-sm font-semibold rounded-xl transition-colors">
                            حذف
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Quick links — billing sub-settings */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="text-sm font-bold text-gray-700 mb-4">إعدادات إضافية</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: `/${locale}/clinic/settings/working-hours`, icon: '🕐', title: 'ساعات العمل', desc: 'تحديد أوقات العمل وأيام الإجازة الأسبوعية' },
            { href: `/${locale}/clinic/settings/insurance`, icon: '🏥', title: 'إعدادات التأمين', desc: 'إدارة شركات التأمين المقبولة ونسب التغطية' },
            { href: `/${locale}/clinic/settings/discounts`, icon: '🏷️', title: 'العروض والخصومات', desc: 'إنشاء كودات الخصم والعروض الخاصة' },
            { href: `/${locale}/clinic/billing/payments`, icon: '💰', title: 'سياسة الدفع', desc: 'تحديد طرق وتوقيت تحصيل المدفوعات' },
            { href: `/${locale}/clinic/branches`, icon: '🏢', title: 'الفروع', desc: 'إدارة فروع وعناوين العيادة' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-start gap-3 p-4 border border-gray-100 rounded-xl hover:border-[#29AAFE] hover:bg-[#E8F5FF] transition-all group">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <div className="text-sm font-semibold text-gray-800 group-hover:text-[#29AAFE]">{item.title}</div>
                <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Toast notification */}
      {toast && <Toast type={toast.type} message={toast.message} />}

    </div>
  );
}
