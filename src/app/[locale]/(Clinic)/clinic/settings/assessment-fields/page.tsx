'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/services/api-client';
import { getApiError } from '@/shared/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FieldConfig {
  stepNumber: number;
  fieldKey: string;
  fieldLabel: string;
  isVisible: boolean;
  isRequired: boolean;
}

// ─── Step metadata ────────────────────────────────────────────────────────────

const STEP_LABELS: Record<number, { label: string; icon: string; color: string }> = {
  2: { label: 'ما بعد الجراحة',     icon: '🩹', color: 'border-orange-200 bg-orange-50' },
  3: { label: 'العلامات التحذيرية',  icon: '🚨', color: 'border-red-200 bg-red-50' },
  4: { label: 'الشكاوى الذاتية',     icon: '🗣️', color: 'border-blue-200 bg-blue-50' },
  5: { label: 'الفحص الموضوعي',      icon: '👁️', color: 'border-teal-200 bg-teal-50' },
  6: { label: 'الفحص العصبي',        icon: '🧠', color: 'border-purple-200 bg-purple-50' },
  7: { label: 'التفكير السريري',     icon: '📋', color: 'border-green-200 bg-green-50' },
};

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-[#29AAFE]' : 'bg-gray-200'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

// ─── Field row ────────────────────────────────────────────────────────────────

function FieldRow({
  field,
  onChange,
}: {
  field: FieldConfig;
  onChange: (key: string, step: number, patch: Partial<FieldConfig>) => void;
}) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
      field.isVisible ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
    }`}>
      <div className="flex items-center gap-2.5 min-w-0">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${field.isVisible ? 'bg-[#29AAFE]' : 'bg-gray-300'}`} />
        <span className="text-sm text-gray-700 font-medium truncate">{field.fieldLabel}</span>
        <span className="text-[10px] font-mono text-gray-300 hidden lg:block">{field.fieldKey}</span>
      </div>
      <div className="flex items-center gap-5 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 hidden sm:block">ظاهر</span>
          <Toggle
            checked={field.isVisible}
            onChange={v => onChange(field.fieldKey, field.stepNumber, { isVisible: v, isRequired: v ? field.isRequired : false })}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 hidden sm:block">إلزامي</span>
          <Toggle
            checked={field.isRequired}
            onChange={v => onChange(field.fieldKey, field.stepNumber, { isRequired: v })}
            disabled={!field.isVisible}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Step section ─────────────────────────────────────────────────────────────

function StepSection({
  stepNumber,
  fields,
  onChange,
}: {
  stepNumber: number;
  fields: FieldConfig[];
  onChange: (key: string, step: number, patch: Partial<FieldConfig>) => void;
}) {
  const [open, setOpen] = useState(true);
  const meta = STEP_LABELS[stepNumber];
  const visibleCount = fields.filter(f => f.isVisible).length;

  return (
    <div className={`rounded-2xl border ${meta.color} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-right"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{meta.icon}</span>
          <span className="font-bold text-gray-800 text-sm">الخطوة {stepNumber}: {meta.label}</span>
          <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-200">
            {visibleCount}/{fields.length} ظاهر
          </span>
        </div>
        <span className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2">
          {fields.map(f => (
            <FieldRow key={f.fieldKey} field={f} onChange={onChange} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm font-bold text-white ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`} dir="rtl">
      {type === 'success' ? '✓' : '✕'} {message}
      <button onClick={onClose} className="opacity-70 hover:opacity-100 text-xs mr-1">✕</button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AssessmentFieldsPage() {
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await apiClient.get<{ data: FieldConfig[] }>('/api/clinic/assessments/field-config');
      setFields(r.data.data);
      setDirty(false);
    } catch {
      setToast({ message: 'فشل تحميل الإعدادات', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleChange = useCallback((key: string, step: number, patch: Partial<FieldConfig>) => {
    setFields(prev => prev.map(f =>
      f.fieldKey === key && f.stepNumber === step ? { ...f, ...patch } : f
    ));
    setDirty(true);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put('/api/clinic/assessments/field-config', {
        fields: fields.map(f => ({
          stepNumber: f.stepNumber,
          fieldKey: f.fieldKey,
          isVisible: f.isVisible,
          isRequired: f.isRequired,
        })),
      });
      setDirty(false);
      setToast({ message: 'تم حفظ الإعدادات بنجاح', type: 'success' });
    } catch (err) {
      setToast({ message: getApiError(err, 'فشل الحفظ'), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Group by step
  const steps = [2, 3, 4, 5, 6, 7];
  const byStep = (step: number) => fields.filter(f => f.stepNumber === step);

  return (
    <div className="space-y-5 max-w-3xl" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-800">إعدادات حقول التقييم</h1>
          <p className="text-xs text-gray-400 mt-0.5">تحكم في الحقول الظاهرة في نموذج التقييم لكل خطوة</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="flex items-center gap-2 bg-[#29AAFE] hover:bg-[#1A8FD9] disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          {saving ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
              </svg>
              جاري الحفظ…
            </>
          ) : (
            <>💾 حفظ التغييرات</>
          )}
        </button>
      </div>

      {/* Legend */}
      <div className="bg-[#E8F5FF] rounded-xl px-4 py-3 flex gap-5 text-xs text-[#29AAFE] font-semibold">
        <span>ℹ️ <strong>ظاهر</strong> — يظهر الحقل في نموذج التقييم</span>
        <span><strong>إلزامي</strong> — الحقل مطلوب قبل الانتقال للخطوة التالية</span>
      </div>

      {/* Steps */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">جاري التحميل…</div>
      ) : (
        <div className="space-y-4">
          {steps.map(step => (
            byStep(step).length > 0 && (
              <StepSection
                key={step}
                stepNumber={step}
                fields={byStep(step)}
                onChange={handleChange}
              />
            )
          ))}
        </div>
      )}

      {/* Dirty indicator */}
      {dirty && !saving && (
        <div className="fixed bottom-6 right-6 bg-yellow-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg" dir="rtl">
          ⚠ يوجد تغييرات غير محفوظة
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
