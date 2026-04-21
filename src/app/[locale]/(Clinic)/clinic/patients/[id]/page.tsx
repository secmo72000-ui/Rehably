'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { patientsService } from '@/domains/patients/patients.service';
import { appointmentsService } from '@/domains/appointments/appointments.service';
import { treatmentPlansService } from '@/domains/treatment-plans/treatment-plans.service';
import type { PatientDetail } from '@/domains/patients/patients.types';
import type { AppointmentItem } from '@/domains/appointments/appointments.types';
import type { TreatmentPlanItem } from '@/domains/treatment-plans/treatment-plans.types';
import { getApiError } from '@/shared/utils';

// ── Types ──────────────────────────────────────────────────
type TabId = 'info' | 'appointments' | 'plans';

// ── Static maps ────────────────────────────────────────────
const patientStatusMap: Record<string, { label: string; cls: string }> = {
  Active:     { label: 'نشط',       cls: 'bg-green-100 text-green-700' },
  Inactive:   { label: 'غير نشط',   cls: 'bg-gray-100 text-gray-500' },
  Discharged: { label: 'منصرف',     cls: 'bg-red-100 text-red-600' },
};

const aptStatusMap: Record<string, { label: string; cls: string }> = {
  Scheduled:  { label: 'مجدول',    cls: 'bg-[#E8F5FF] text-[#29AAFE]' },
  Confirmed:  { label: 'مؤكد',     cls: 'bg-green-50 text-green-600' },
  Completed:  { label: 'مكتمل',    cls: 'bg-gray-100 text-gray-600' },
  Cancelled:  { label: 'ملغي',     cls: 'bg-red-50 text-red-500' },
  NoShow:     { label: 'لم يحضر',  cls: 'bg-orange-50 text-orange-500' },
};

const aptTypeMap: Record<string, string> = {
  Treatment:    'علاجية',
  Assessment:   'تقييم',
  Followup:     'متابعة',
  Consultation: 'استشارة',
};

const planStatusMap: Record<string, { label: string; cls: string }> = {
  Draft:     { label: 'مسودة',   cls: 'bg-gray-100 text-gray-500' },
  Active:    { label: 'نشط',     cls: 'bg-[#E8F5FF] text-[#29AAFE]' },
  Completed: { label: 'مكتمل',   cls: 'bg-green-50 text-green-600' },
  Cancelled: { label: 'ملغي',    cls: 'bg-red-50 text-red-500' },
};

// ── Helpers ────────────────────────────────────────────────
function fmtDate(iso?: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' });
}

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('ar-SA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
}

function initials(p: PatientDetail): string {
  return ((p.firstName?.[0] ?? '') + (p.lastName?.[0] ?? '')).toUpperCase();
}

function displayName(p: PatientDetail): string {
  if (p.firstNameArabic || p.lastNameArabic) {
    return `${p.firstNameArabic ?? p.firstName} ${p.lastNameArabic ?? p.lastName}`;
  }
  return `${p.firstName} ${p.lastName}`;
}

// ── Sub-components ─────────────────────────────────────────

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-black text-gray-800 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-400 font-semibold shrink-0">{label}</span>
      <span className="text-xs font-bold text-gray-700 text-left mr-2 break-all">{value ?? '—'}</span>
    </div>
  );
}

function FormField({
  label, value, onChange, type = 'text', placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#29AAFE] transition-colors"
        dir="rtl"
      />
    </div>
  );
}

function TextAreaField({
  label, value, onChange, rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#29AAFE] resize-none transition-colors"
        dir="rtl"
      />
    </div>
  );
}

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-[#29AAFE] rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-gray-500 whitespace-nowrap">{done}/{total}</span>
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────
interface ToastMsg { id: number; type: 'success' | 'error'; text: string }

function Toast({ toasts, onDismiss }: { toasts: ToastMsg[]; onDismiss: (id: number) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          onClick={() => onDismiss(t.id)}
          className={`pointer-events-auto flex items-center gap-2 px-5 py-3 rounded-2xl shadow-lg text-sm font-bold cursor-pointer transition-all
            ${t.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
        >
          {t.type === 'success' ? '✓' : '✕'} {t.text}
        </div>
      ))}
    </div>
  );
}

// ── Discharge confirm dialog ───────────────────────────────
function DischargeDialog({
  patientName,
  onConfirm,
  onCancel,
  loading,
}: {
  patientName: string;
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
        className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-center w-14 h-14 bg-red-100 rounded-2xl mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5">
            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h3 className="text-base font-black text-gray-800 text-center mb-2">تصريف المريض</h3>
        <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
          هل أنت متأكد من تصريف <span className="font-bold text-gray-800">{patientName}</span>؟
          لا يمكن التراجع عن هذا الإجراء.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white transition-colors"
          >
            {loading ? 'جاري التصريف...' : 'تصريف المريض'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tab 1: Personal Info ───────────────────────────────────
type EditForm = {
  firstName: string; lastName: string;
  firstNameArabic: string; lastNameArabic: string;
  nationalId: string; dateOfBirth: string; gender: string;
  phone: string; email: string; address: string; city: string;
  emergencyContactName: string; emergencyContactPhone: string; emergencyContactRelation: string;
  diagnosis: string; medicalHistory: string; allergies: string;
  currentMedications: string; notes: string;
};

function patientToForm(p: PatientDetail): EditForm {
  return {
    firstName: p.firstName,
    lastName: p.lastName,
    firstNameArabic: p.firstNameArabic ?? '',
    lastNameArabic: p.lastNameArabic ?? '',
    nationalId: p.nationalId ?? '',
    dateOfBirth: p.dateOfBirth ? p.dateOfBirth.slice(0, 10) : '',
    gender: p.gender,
    phone: p.phone ?? '',
    email: p.email ?? '',
    address: p.address ?? '',
    city: p.city ?? '',
    emergencyContactName: p.emergencyContactName ?? '',
    emergencyContactPhone: p.emergencyContactPhone ?? '',
    emergencyContactRelation: p.emergencyContactRelation ?? '',
    diagnosis: p.diagnosis ?? '',
    medicalHistory: p.medicalHistory ?? '',
    allergies: p.allergies ?? '',
    currentMedications: p.currentMedications ?? '',
    notes: p.notes ?? '',
  };
}

function InfoTab({
  patient,
  onPatientUpdated,
  onDischarge,
  showToast,
}: {
  patient: PatientDetail;
  onPatientUpdated: (p: PatientDetail) => void;
  onDischarge: () => void;
  showToast: (type: 'success' | 'error', text: string) => void;
}) {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<EditForm>(() => patientToForm(patient));
  const [saving, setSaving] = useState(false);

  const set = (k: keyof EditForm, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await patientsService.update(patient.id, {
        firstName: form.firstName,
        lastName: form.lastName,
        firstNameArabic: form.firstNameArabic || undefined,
        lastNameArabic: form.lastNameArabic || undefined,
        nationalId: form.nationalId || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender === 'Male' ? 0 : 1,
        phone: form.phone || undefined,
        email: form.email || undefined,
        address: form.address || undefined,
        city: form.city || undefined,
        emergencyContactName: form.emergencyContactName || undefined,
        emergencyContactPhone: form.emergencyContactPhone || undefined,
        emergencyContactRelation: form.emergencyContactRelation || undefined,
        diagnosis: form.diagnosis || undefined,
        medicalHistory: form.medicalHistory || undefined,
        allergies: form.allergies || undefined,
        currentMedications: form.currentMedications || undefined,
        notes: form.notes || undefined,
      });
      onPatientUpdated(updated);
      setEditMode(false);
      showToast('success', 'تم حفظ بيانات المريض بنجاح');
    } catch (err) {
      showToast('error', getApiError(err, 'فشل في حفظ البيانات. حاول مرة أخرى.'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(patientToForm(patient));
    setEditMode(false);
  };

  if (editMode) {
    return (
      <div className="space-y-5">
        {/* Edit header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-gray-700">تعديل بيانات المريض</h3>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#29AAFE] hover:bg-[#1A8FD9] disabled:opacity-60 text-white transition-colors"
            >
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </div>
        </div>

        {/* Section: Basic Info */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">المعلومات الأساسية</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="الاسم الأول (إنجليزي)" value={form.firstName} onChange={v => set('firstName', v)} />
            <FormField label="الاسم الأخير (إنجليزي)" value={form.lastName} onChange={v => set('lastName', v)} />
            <FormField label="الاسم الأول بالعربي" value={form.firstNameArabic} onChange={v => set('firstNameArabic', v)} />
            <FormField label="الاسم الأخير بالعربي" value={form.lastNameArabic} onChange={v => set('lastNameArabic', v)} />
            <FormField label="رقم الهوية" value={form.nationalId} onChange={v => set('nationalId', v)} />
            <FormField label="تاريخ الميلاد" value={form.dateOfBirth} onChange={v => set('dateOfBirth', v)} type="date" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">الجنس</label>
            <div className="flex gap-3">
              {([['Male', 'ذكر'], ['Female', 'أنثى']] as const).map(([val, lbl]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => set('gender', val)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors
                    ${form.gender === val
                      ? 'bg-[#29AAFE] text-white border-[#29AAFE]'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="الهاتف" value={form.phone} onChange={v => set('phone', v)} type="tel" />
            <FormField label="البريد الإلكتروني" value={form.email} onChange={v => set('email', v)} type="email" />
            <FormField label="العنوان" value={form.address} onChange={v => set('address', v)} />
            <FormField label="المدينة" value={form.city} onChange={v => set('city', v)} />
          </div>
        </div>

        {/* Section: Emergency Contact */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">جهة الاتصال الطارئ</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="الاسم" value={form.emergencyContactName} onChange={v => set('emergencyContactName', v)} />
            <FormField label="رقم الهاتف" value={form.emergencyContactPhone} onChange={v => set('emergencyContactPhone', v)} type="tel" />
            <FormField label="صلة القرابة" value={form.emergencyContactRelation} onChange={v => set('emergencyContactRelation', v)} />
          </div>
        </div>

        {/* Section: Medical Info */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">المعلومات الطبية</h4>
          <TextAreaField label="التشخيص" value={form.diagnosis} onChange={v => set('diagnosis', v)} />
          <TextAreaField label="التاريخ المرضي" value={form.medicalHistory} onChange={v => set('medicalHistory', v)} rows={4} />
          <TextAreaField label="الحساسية" value={form.allergies} onChange={v => set('allergies', v)} />
          <TextAreaField label="الأدوية الحالية" value={form.currentMedications} onChange={v => set('currentMedications', v)} />
          <TextAreaField label="ملاحظات" value={form.notes} onChange={v => set('notes', v)} rows={4} />
        </div>

        {/* Discharge button */}
        {patient.status !== 'Discharged' && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h4 className="text-sm font-black text-gray-800 mb-3">إجراءات خاصة</h4>
            <button
              onClick={onDischarge}
              className="w-full py-3 rounded-xl text-sm font-bold border-2 border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            >
              تصريف المريض
            </button>
          </div>
        )}
      </div>
    );
  }

  // View mode
  return (
    <div className="space-y-5">
      {/* Edit button row */}
      <div className="flex justify-end">
        <button
          onClick={() => setEditMode(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          تعديل
        </button>
      </div>

      {/* 2-column info grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <InfoCard title="المعلومات الشخصية">
          <InfoRow label="الاسم الكامل"     value={`${patient.firstName} ${patient.lastName}`} />
          <InfoRow label="الاسم بالعربي"    value={
            (patient.firstNameArabic || patient.lastNameArabic)
              ? `${patient.firstNameArabic ?? ''} ${patient.lastNameArabic ?? ''}`.trim()
              : null
          } />
          <InfoRow label="رقم الهوية"       value={patient.nationalId} />
          <InfoRow label="تاريخ الميلاد"    value={fmtDate(patient.dateOfBirth)} />
          <InfoRow label="الجنس"            value={patient.gender === 'Male' ? 'ذكر' : 'أنثى'} />
          <InfoRow label="الهاتف"           value={patient.phone} />
          <InfoRow label="البريد الإلكتروني" value={patient.email} />
        </InfoCard>

        <InfoCard title="معلومات الإقامة">
          <InfoRow label="العنوان" value={patient.address} />
          <InfoRow label="المدينة" value={patient.city} />
          <InfoRow label="تاريخ التسجيل"  value={fmtDate(patient.createdAt)} />
          {patient.dischargedAt && (
            <InfoRow label="تاريخ التصريف" value={fmtDate(patient.dischargedAt)} />
          )}
        </InfoCard>

        <InfoCard title="جهة الاتصال الطارئ">
          <InfoRow label="الاسم"         value={patient.emergencyContactName} />
          <InfoRow label="رقم الهاتف"    value={patient.emergencyContactPhone} />
          <InfoRow label="صلة القرابة"   value={patient.emergencyContactRelation} />
        </InfoCard>

        <InfoCard title="التشخيص">
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {patient.diagnosis ?? '—'}
          </p>
        </InfoCard>

        <InfoCard title="التاريخ المرضي">
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {patient.medicalHistory ?? 'لا توجد بيانات'}
          </p>
        </InfoCard>

        <InfoCard title="الحساسية">
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {patient.allergies ?? 'لا توجد بيانات'}
          </p>
        </InfoCard>

        <InfoCard title="الأدوية الحالية">
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {patient.currentMedications ?? 'لا توجد بيانات'}
          </p>
        </InfoCard>

        {patient.notes && (
          <InfoCard title="ملاحظات">
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{patient.notes}</p>
          </InfoCard>
        )}
      </div>

      {/* Discharge button */}
      {patient.status !== 'Discharged' && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h4 className="text-sm font-black text-gray-800 mb-3">إجراءات خاصة</h4>
          <button
            onClick={onDischarge}
            className="w-full py-3 rounded-xl text-sm font-bold border-2 border-red-200 text-red-600 hover:bg-red-50 transition-colors"
          >
            تصريف المريض
          </button>
        </div>
      )}
    </div>
  );
}

// ── Tab 2: Appointments ────────────────────────────────────
function AppointmentsTab({ patientId }: { patientId: string }) {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await appointmentsService.getAll({ patientId, page: 1, pageSize: 10 });
        setAppointments(result.items);
      } catch (err) {
        setError(getApiError(err, 'فشل في تحميل البيانات'));
      } finally {
        setLoading(false);
      }
    })();
  }, [patientId]);

  if (loading) {
    return <div className="text-center py-16 text-gray-400 text-sm">جاري التحميل...</div>;
  }

  if (error) {
    return <div className="bg-red-50 text-red-600 rounded-2xl px-5 py-4 text-sm">{error}</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" dir="rtl">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {['التاريخ والوقت', 'المعالج', 'النوع', 'المدة', 'الحالة'].map(h => (
                <th key={h} className="px-4 py-3 text-right text-xs font-bold text-gray-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-gray-400 text-sm">لا توجد بيانات</td>
              </tr>
            ) : (
              appointments.map(a => {
                const s = aptStatusMap[a.status] ?? { label: a.status, cls: 'bg-gray-100 text-gray-500' };
                return (
                  <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-bold text-gray-800 text-xs">{fmtDateTime(a.startTime)}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {fmtTime(a.startTime)} – {fmtTime(a.endTime)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                      {a.therapistName ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                      {aptTypeMap[a.type] ?? a.type}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                      {a.durationMinutes} دقيقة
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.cls}`}>
                        {s.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab 3: Treatment Plans ─────────────────────────────────
function PlansTab({ patientId, locale }: { patientId: string; locale: string }) {
  const [plans, setPlans] = useState<TreatmentPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await treatmentPlansService.getAll({ patientId });
        setPlans(result.items);
      } catch (err) {
        setError(getApiError(err, 'فشل في تحميل البيانات'));
      } finally {
        setLoading(false);
      }
    })();
  }, [patientId]);

  if (loading) {
    return <div className="text-center py-16 text-gray-400 text-sm">جاري التحميل...</div>;
  }

  if (error) {
    return <div className="bg-red-50 text-red-600 rounded-2xl px-5 py-4 text-sm">{error}</div>;
  }

  if (plans.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-16 shadow-sm flex flex-col items-center gap-3 text-gray-400">
        <span className="text-4xl">📋</span>
        <span className="text-sm font-semibold">لا توجد بيانات</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {plans.map(plan => {
        const s = planStatusMap[plan.status] ?? { label: plan.status, cls: 'bg-gray-100 text-gray-500' };
        const pct = plan.totalSessionsPlanned > 0
          ? Math.round((plan.completedSessions / plan.totalSessionsPlanned) * 100)
          : 0;
        return (
          <div
            key={plan.id}
            className="bg-white rounded-2xl p-5 shadow-sm border border-transparent hover:border-[#29AAFE]/30 transition-all"
          >
            {/* Plan header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 ml-2">
                <h3 className="font-black text-gray-800 text-sm leading-snug">{plan.title}</h3>
                {plan.therapistName && (
                  <p className="text-xs text-gray-400 mt-0.5">{plan.therapistName}</p>
                )}
              </div>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${s.cls}`}>
                {s.label}
              </span>
            </div>

            {/* Diagnosis */}
            {plan.diagnosis && (
              <p className="text-xs text-gray-500 mb-3">{plan.diagnosis}</p>
            )}

            {/* Dates */}
            <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
              <span>بدأ: {fmtDate(plan.startDate)}</span>
              {plan.endDate && <span>ينتهي: {fmtDate(plan.endDate)}</span>}
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-400 font-semibold">تقدم الجلسات</span>
                <span className="text-xs font-bold text-[#29AAFE]">{pct}%</span>
              </div>
              <ProgressBar done={plan.completedSessions} total={plan.totalSessionsPlanned} />
            </div>

            {/* Link */}
            <Link
              href={`/${locale}/clinic/treatment-plans/${plan.id}`}
              className="block text-center bg-[#E8F5FF] text-[#29AAFE] text-xs font-bold py-2 rounded-xl hover:bg-[#29AAFE] hover:text-white transition-colors"
            >
              عرض التفاصيل
            </Link>
          </div>
        );
      })}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────
export default function PatientProfilePage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';
  const patientId = params?.id as string;

  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('info');
  const [activatedTabs, setActivatedTabs] = useState<Set<TabId>>(new Set(['info']));

  const [showDischargeDialog, setShowDischargeDialog] = useState(false);
  const [discharging, setDischarging] = useState(false);

  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const toastIdRef = useRef(0);

  // ── Toast helpers ──────────────────────────────────────
  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Load patient ───────────────────────────────────────
  const loadPatient = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await patientsService.getById(patientId);
      setPatient(data);
    } catch (err) {
      setError(getApiError(err, 'فشل في تحميل البيانات'));
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { loadPatient(); }, [loadPatient]);

  // ── Tab activation (lazy) ──────────────────────────────
  const handleTabClick = (tab: TabId) => {
    setActiveTab(tab);
    setActivatedTabs(prev => new Set([...prev, tab]));
  };

  // ── Discharge ──────────────────────────────────────────
  const handleDischarge = async () => {
    if (!patient) return;
    setDischarging(true);
    try {
      const updated = await patientsService.discharge(patient.id);
      setPatient(updated);
      setShowDischargeDialog(false);
      showToast('success', 'تم تصريف المريض بنجاح');
    } catch (err) {
      showToast('error', getApiError(err, 'فشل في تصريف المريض. حاول مرة أخرى.'));
    } finally {
      setDischarging(false);
    }
  };

  // ── Render states ──────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm" dir="rtl">
        جاري التحميل...
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="space-y-4" dir="rtl">
        <Link
          href={`/${locale}/clinic/patients`}
          className="inline-flex items-center gap-1.5 text-gray-400 hover:text-[#29AAFE] text-sm transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
          العودة للمرضى
        </Link>
        <div className="bg-red-50 text-red-600 rounded-2xl px-5 py-4 text-sm">
          {error ?? 'المريض غير موجود'}
        </div>
      </div>
    );
  }

  const status = patientStatusMap[patient.status] ?? { label: patient.status, cls: 'bg-gray-100 text-gray-500' };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'info',         label: 'المعلومات الشخصية' },
    { id: 'appointments', label: 'المواعيد' },
    { id: 'plans',        label: 'خطط العلاج' },
  ];

  return (
    <div className="space-y-5" dir="rtl">
      {/* ── Back button ─────────────────────────────────── */}
      <Link
        href={`/${locale}/clinic/patients`}
        className="inline-flex items-center gap-1.5 text-gray-400 hover:text-[#29AAFE] text-sm transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
        العودة للمرضى
      </Link>

      {/* ── Header card ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        {/* Avatar + name row */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-4">
            {patient.profileImageUrl ? (
              <img
                src={patient.profileImageUrl}
                alt=""
                className="w-16 h-16 rounded-2xl object-cover shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#29AAFE] to-[#1A8FD9] flex items-center justify-center text-white text-xl font-black shrink-0">
                {initials(patient)}
              </div>
            )}
            <div>
              <h2 className="text-lg font-black text-gray-800">{displayName(patient)}</h2>
              {/* Show English name as subtitle if Arabic is primary */}
              {(patient.firstNameArabic || patient.lastNameArabic) && (
                <p className="text-sm text-gray-400 mt-0.5">{patient.firstName} {patient.lastName}</p>
              )}
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full shrink-0 ${status.cls}`}>
            {status.label}
          </span>
        </div>

        {/* Stat chips */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#E8F5FF] rounded-xl p-3 text-center">
            <div className="text-xl font-black text-[#29AAFE]">{patient.appointmentsCount}</div>
            <div className="text-xs text-gray-400 mt-0.5">عدد المواعيد</div>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <div className="text-xl font-black text-green-600">{patient.activeTreatmentPlansCount}</div>
            <div className="text-xs text-gray-400 mt-0.5">خطط العلاج النشطة</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <div className="text-sm font-black text-gray-700 leading-tight mt-1">
              {fmtDate(patient.createdAt)}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">تاريخ التسجيل</div>
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────── */}
      <div className="flex gap-0.5 border-b-2 border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`px-4 py-2.5 text-sm font-bold transition-all border-b-2 -mb-[2px] whitespace-nowrap
              ${activeTab === tab.id
                ? 'text-[#29AAFE] border-[#29AAFE]'
                : 'text-gray-400 border-transparent hover:text-gray-600'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ─────────────────────────────────── */}
      {activeTab === 'info' && activatedTabs.has('info') && (
        <InfoTab
          patient={patient}
          onPatientUpdated={setPatient}
          onDischarge={() => setShowDischargeDialog(true)}
          showToast={showToast}
        />
      )}

      {activeTab === 'appointments' && activatedTabs.has('appointments') && (
        <AppointmentsTab patientId={patientId} />
      )}

      {activeTab === 'plans' && activatedTabs.has('plans') && (
        <PlansTab patientId={patientId} locale={locale} />
      )}

      {/* ── Discharge dialog ─────────────────────────────── */}
      {showDischargeDialog && (
        <DischargeDialog
          patientName={displayName(patient)}
          onConfirm={handleDischarge}
          onCancel={() => setShowDischargeDialog(false)}
          loading={discharging}
        />
      )}

      {/* ── Toast container ──────────────────────────────── */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
