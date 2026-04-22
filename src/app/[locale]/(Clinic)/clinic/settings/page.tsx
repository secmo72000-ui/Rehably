'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiClient } from '@/services/api-client';
import { getApiError } from '@/shared/utils';

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

type SettingsTab = 'clinic' | 'contact' | 'appointments';

// ─── Appointment duration constants (shared with appointments page) ────────────

const DURATION_STORAGE_KEY = 'rehably_apt_durations';

const HARDCODED_DURATIONS: Record<number, number> = {
  0: 60,   // علاج طبيعي
  1: 90,   // تقييم
  2: 30,   // متابعة
  3: 30,   // استشارة
};

const SERVICE_TYPES: { id: number; label: string; icon: string; hint: string }[] = [
  { id: 0, label: 'علاج طبيعي',  icon: '🩺', hint: 'جلسة علاج — عادةً 45-60 دقيقة' },
  { id: 1, label: 'تقييم',       icon: '📋', hint: 'جلسة تقييم أولية — عادةً 60-90 دقيقة' },
  { id: 2, label: 'متابعة',      icon: '🔄', hint: 'جلسة متابعة — عادةً 20-30 دقيقة' },
  { id: 3, label: 'استشارة',     icon: '💬', hint: 'استشارة طبية — عادةً 15-30 دقيقة' },
];

function loadDurationsFromStorage(): Record<number, number> {
  if (typeof window === 'undefined') return { ...HARDCODED_DURATIONS };
  try {
    const raw = localStorage.getItem(DURATION_STORAGE_KEY);
    if (raw) return { ...HARDCODED_DURATIONS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...HARDCODED_DURATIONS };
}

function saveDurationsToStorage(d: Record<number, number>) {
  try { localStorage.setItem(DURATION_STORAGE_KEY, JSON.stringify(d)); } catch { /* ignore */ }
}

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

  // Appointment durations — loaded from localStorage, saved on click
  const [durations, setDurations] = useState<Record<number, number>>(HARDCODED_DURATIONS);
  const [durationsSaved, setDurationsSaved] = useState(false);

  useEffect(() => {
    setDurations(loadDurationsFromStorage());
  }, []);

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

  // ── Duration save handler ──────────────────────────────────────────────────

  const handleSaveDurations = () => {
    saveDurationsToStorage(durations);
    setDurationsSaved(true);
    showToast('success', 'تم حفظ مدد الجلسات الافتراضية');
    setTimeout(() => setDurationsSaved(false), 2000);
  };

  const handleResetDurations = () => {
    setDurations({ ...HARDCODED_DURATIONS });
  };

  // ── Tab definitions ────────────────────────────────────────────────────────

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'clinic',       label: 'معلومات العيادة' },
    { id: 'contact',      label: 'معلومات الاتصال' },
    { id: 'appointments', label: 'إعدادات المواعيد' },
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

          {/* ── Tab 3: Appointment Settings ───────────────────────────────── */}
          {activeTab === 'appointments' && (
            <div className="space-y-6 max-w-2xl">

              {/* Default durations card */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-gray-700">مدة الجلسة الافتراضية لكل نوع موعد</h3>
                  <button
                    type="button"
                    onClick={handleResetDurations}
                    className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
                  >
                    إعادة تعيين الافتراضيات
                  </button>
                </div>
                <p className="text-xs text-gray-400 mb-5">
                  عند اختيار نوع الموعد سيتم حساب وقت النهاية تلقائياً بناءً على هذه المدة.
                </p>

                <div className="space-y-3">
                  {SERVICE_TYPES.map(st => {
                    const val = durations[st.id] ?? HARDCODED_DURATIONS[st.id];
                    return (
                      <div key={st.id}
                        className="flex items-center gap-4 border border-gray-200 rounded-xl px-4 py-3 hover:border-[#29AAFE]/40 transition-colors">
                        {/* Icon + label */}
                        <div className="flex items-center gap-2.5 min-w-[130px]">
                          <span className="text-xl">{st.icon}</span>
                          <div>
                            <div className="text-sm font-bold text-gray-800">{st.label}</div>
                            <div className="text-[11px] text-gray-400">{st.hint}</div>
                          </div>
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center gap-2 mr-auto">
                          <button
                            type="button"
                            onClick={() => setDurations(d => ({ ...d, [st.id]: Math.max(5, (d[st.id] ?? 60) - 5) }))}
                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 font-bold text-lg leading-none"
                          >−</button>
                          <div className="flex items-center gap-1 min-w-[90px] justify-center">
                            <input
                              type="number"
                              min={5}
                              max={480}
                              step={5}
                              value={val}
                              onChange={e => {
                                const n = Math.max(5, Math.min(480, Number(e.target.value) || 5));
                                setDurations(d => ({ ...d, [st.id]: n }));
                              }}
                              className="w-14 text-center border border-gray-200 rounded-lg py-1.5 text-sm font-bold outline-none focus:border-[#29AAFE] focus:ring-2 focus:ring-[#29AAFE]/10"
                              dir="ltr"
                            />
                            <span className="text-xs text-gray-400">د</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDurations(d => ({ ...d, [st.id]: Math.min(480, (d[st.id] ?? 60) + 5) }))}
                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 font-bold text-lg leading-none"
                          >+</button>
                        </div>

                        {/* Duration label */}
                        <div className={`text-xs px-2.5 py-1 rounded-full font-bold min-w-[80px] text-center ${
                          val === HARDCODED_DURATIONS[st.id]
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-[#E8F5FF] text-[#29AAFE]'
                        }`}>
                          {fmtDuration(val)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Save */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveDurations}
                  className={`inline-flex items-center gap-2 font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-sm ${
                    durationsSaved
                      ? 'bg-green-500 text-white'
                      : 'bg-[#29AAFE] hover:bg-[#1A8FD9] text-white'
                  }`}
                >
                  {durationsSaved ? '✓ تم الحفظ' : 'حفظ الإعدادات'}
                </button>
                <p className="text-xs text-gray-400">
                  تُحفظ هذه الإعدادات محلياً على هذا الجهاز
                </p>
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
