'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { treatmentPlansService } from '@/domains/treatment-plans/treatment-plans.service';
import { assessmentService } from '@/domains/assessment';
import { specialityService } from '@/domains/clinical';
import type {
  AssessmentDetail, CreateAssessmentRequest,
  StepPostOpDto, StepRedFlagsDto, StepSubjectiveDto,
  StepObjectiveDto, StepNeuroDto, StepClinicalReasoningDto,
} from '@/domains/assessment';
import type { SpecialityDto, ClinicSpecialityDto } from '@/domains/clinical';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STEPS = [
  { n: 1, label: 'بيانات المريض' },
  { n: 2, label: 'ما بعد العملية' },
  { n: 3, label: 'الإنذارات الحمراء' },
  { n: 4, label: 'الشكوى الرئيسية' },
  { n: 5, label: 'الفحص السريري' },
  { n: 6, label: 'الفحص العصبي' },
  { n: 7, label: 'التفكير السريري' },
];

const PAIN_COLORS = ['bg-green-500','bg-green-400','bg-lime-400','bg-yellow-400','bg-yellow-500',
  'bg-orange-400','bg-orange-500','bg-red-400','bg-red-500','bg-red-600','bg-red-700'];

function PainSlider({ value, onChange, label }: { value?: number; onChange: (v: number) => void; label: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-semibold text-gray-600">{label}</label>
        <span className={`text-xs font-black px-2 py-0.5 rounded text-white ${PAIN_COLORS[value ?? 0]}`}>
          {value ?? 0} / 10
        </span>
      </div>
      <input type="range" min={0} max={10} value={value ?? 0}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-[#29AAFE] h-2 rounded-full cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
        <span>لا ألم</span><span>ألم شديد</span>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1">
        {label}{required && <span className="text-red-500 mr-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#29AAFE] focus:ring-1 focus:ring-[#29AAFE]/20 bg-white transition-colors";
const textareaCls = inputCls + " resize-none";
const selectCls = inputCls;

function Toggle({ label, value, onChange }: { label: string; value?: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-700">{label}</span>
      <button type="button" onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-colors ${value ? 'bg-[#29AAFE]' : 'bg-gray-200'}`}>
        <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${value ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

function ChipGroup({ options, selected, onChange }: {
  options: { key: string; label: string }[];
  selected: string[];
  onChange: (keys: string[]) => void;
}) {
  const toggle = (k: string) =>
    onChange(selected.includes(k) ? selected.filter(x => x !== k) : [...selected, k]);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button key={o.key} type="button" onClick={() => toggle(o.key)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
            selected.includes(o.key)
              ? 'bg-[#29AAFE] text-white border-[#29AAFE]'
              : 'bg-white text-gray-600 border-gray-200 hover:border-[#29AAFE]'
          }`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── ROM Table ────────────────────────────────────────────────────────────────

interface RomRow { movement: string; arom: string; prom: string; painEndFeel: string; notes: string; }

function RomTable({ value, onChange }: { value: RomRow[]; onChange: (v: RomRow[]) => void }) {
  const addRow = () => onChange([...value, { movement: '', arom: '', prom: '', painEndFeel: '', notes: '' }]);
  const del = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const upd = (i: number, k: keyof RomRow, v: string) => {
    const next = [...value]; next[i] = { ...next[i], [k]: v }; onChange(next);
  };
  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-xs">
          <thead><tr className="bg-gray-50">
            {['الحركة','AROM','PROM','نهاية الحركة','ملاحظات',''].map(h => (
              <th key={h} className="px-3 py-2 text-right font-semibold text-gray-500">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {value.map((row, i) => (
              <tr key={i} className="border-t border-gray-100">
                {(['movement','arom','prom','painEndFeel','notes'] as (keyof RomRow)[]).map(k => (
                  <td key={k} className="px-2 py-1">
                    <input value={row[k]} onChange={e => upd(i, k, e.target.value)}
                      className="w-full border-0 outline-none text-sm bg-transparent py-1 min-w-[60px]" />
                  </td>
                ))}
                <td className="px-2 py-1">
                  <button onClick={() => del(i)} className="text-red-400 hover:text-red-600 text-base leading-none">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={addRow}
        className="mt-2 text-xs text-[#29AAFE] hover:underline font-semibold">+ إضافة حركة</button>
    </div>
  );
}

// ─── Strength Table ───────────────────────────────────────────────────────────

interface StrRow { muscleGroup: string; left: string; right: string; painLimited: boolean; notes: string; }

function StrengthTable({ value, onChange }: { value: StrRow[]; onChange: (v: StrRow[]) => void }) {
  const addRow = () => onChange([...value, { muscleGroup: '', left: '', right: '', painLimited: false, notes: '' }]);
  const del = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const upd = (i: number, k: keyof StrRow, v: string | boolean) => {
    const next = [...value]; next[i] = { ...next[i], [k]: v }; onChange(next);
  };
  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-xs">
          <thead><tr className="bg-gray-50">
            {['المجموعة العضلية','يسار','يمين','ألم محدِّد','ملاحظات',''].map(h => (
              <th key={h} className="px-3 py-2 text-right font-semibold text-gray-500">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {value.map((row, i) => (
              <tr key={i} className="border-t border-gray-100">
                <td className="px-2 py-1"><input value={row.muscleGroup} onChange={e => upd(i,'muscleGroup',e.target.value)} className="w-full border-0 outline-none text-sm bg-transparent min-w-[100px]" /></td>
                <td className="px-2 py-1"><input value={row.left} onChange={e => upd(i,'left',e.target.value)} className="w-16 border-0 outline-none text-sm bg-transparent" placeholder="0-5"/></td>
                <td className="px-2 py-1"><input value={row.right} onChange={e => upd(i,'right',e.target.value)} className="w-16 border-0 outline-none text-sm bg-transparent" placeholder="0-5"/></td>
                <td className="px-2 py-1 text-center">
                  <button type="button" onClick={() => upd(i,'painLimited',!row.painLimited)}
                    className={`w-4 h-4 rounded border ${row.painLimited ? 'bg-[#29AAFE] border-[#29AAFE]' : 'border-gray-300'} flex items-center justify-center mx-auto`}>
                    {row.painLimited && <span className="text-white text-xs leading-none">✓</span>}
                  </button>
                </td>
                <td className="px-2 py-1"><input value={row.notes} onChange={e => upd(i,'notes',e.target.value)} className="w-full border-0 outline-none text-sm bg-transparent"/></td>
                <td className="px-2 py-1"><button onClick={() => del(i)} className="text-red-400 hover:text-red-600 text-base leading-none">×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={addRow} className="mt-2 text-xs text-[#29AAFE] hover:underline font-semibold">+ إضافة عضلة</button>
    </div>
  );
}

// ─── Step components ──────────────────────────────────────────────────────────

function Step1({ data, onChange, specialities }: {
  data: CreateAssessmentRequest;
  onChange: (d: CreateAssessmentRequest) => void;
  specialities: ClinicSpecialityDto[];
}) {
  return (
    <div className="space-y-4">
      <Field label="التخصص" required>
        <select value={data.specialityId} onChange={e => onChange({ ...data, specialityId: e.target.value })} className={selectCls}>
          <option value="">— اختر التخصص —</option>
          {specialities.map(s => <option key={s.specialityId} value={s.specialityId}>{s.nameAr} ({s.code})</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="عمر المريض">
          <input type="number" min={1} max={120} value={data.patientAge ?? ''} onChange={e => onChange({ ...data, patientAge: e.target.value ? Number(e.target.value) : undefined })} className={inputCls} placeholder="بالسنوات" />
        </Field>
        <Field label="الجنس">
          <select value={data.gender ?? ''} onChange={e => onChange({ ...data, gender: e.target.value || undefined })} className={selectCls}>
            <option value="">— اختر —</option>
            <option value="Male">ذكر</option>
            <option value="Female">أنثى</option>
          </select>
        </Field>
      </div>
      <Field label="التشخيص (نص حر)">
        <input type="text" value={data.diagnosisFreeText ?? ''} onChange={e => onChange({ ...data, diagnosisFreeText: e.target.value })} className={inputCls} placeholder="أدخل التشخيص أو الشكوى الرئيسية..." />
      </Field>
      <Field label="ملاحظات إضافية">
        <textarea rows={3} value={data.additionalNotes ?? ''} onChange={e => onChange({ ...data, additionalNotes: e.target.value })} className={textareaCls} placeholder="أي ملاحظات أخرى..." />
      </Field>
      <Toggle label="المريض أجرى عملية جراحية" value={data.hasPostOp} onChange={v => onChange({ ...data, hasPostOp: v })} />
    </div>
  );
}

function Step2({ data, onChange }: { data: StepPostOpDto; onChange: (d: StepPostOpDto) => void }) {
  const woundOptions = [
    { key: 'clean', label: 'نظيفة' }, { key: 'redness', label: 'احمرار' },
    { key: 'drainage', label: 'إفرازات' }, { key: 'fever', label: 'حرارة' },
  ];
  const wbOptions = [
    { key: 'NWB', label: 'NWB' }, { key: 'TTWB', label: 'TTWB' },
    { key: 'PWB', label: 'PWB' }, { key: 'WBAT', label: 'WBAT' }, { key: 'FWB', label: 'FWB' },
  ];
  const woundSelected: string[] = data.woundStatus ? JSON.parse(data.woundStatus) : [];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="اسم العملية">
          <input value={data.procedureName ?? ''} onChange={e => onChange({ ...data, procedureName: e.target.value })} className={inputCls} placeholder="مثال: استبدال الركبة" />
        </Field>
        <Field label="الجانب">
          <select value={data.procedureSide ?? ''} onChange={e => onChange({ ...data, procedureSide: e.target.value })} className={selectCls}>
            <option value="">— اختر —</option>
            <option value="Left">يسار</option><option value="Right">يمين</option><option value="Bilateral">كلاهما</option>
          </select>
        </Field>
        <Field label="تاريخ العملية">
          <input type="date" value={data.surgeryDate ? data.surgeryDate.split('T')[0] : ''} onChange={e => onChange({ ...data, surgeryDate: e.target.value })} className={inputCls} />
        </Field>
        <Field label="أيام ما بعد العملية">
          <input type="number" min={0} value={data.daysPostOp ?? ''} onChange={e => onChange({ ...data, daysPostOp: e.target.value ? Number(e.target.value) : undefined })} className={inputCls} />
        </Field>
      </div>
      <Field label="المستشفى / الجراح">
        <input value={data.surgeonFacility ?? ''} onChange={e => onChange({ ...data, surgeonFacility: e.target.value })} className={inputCls} />
      </Field>
      <Field label="حالة حمل الوزن">
        <ChipGroup options={wbOptions} selected={data.weightBearingStatus ? [data.weightBearingStatus] : []}
          onChange={keys => onChange({ ...data, weightBearingStatus: keys[keys.length - 1] })} />
      </Field>
      <Field label="قيود ROM">
        <input value={data.romRestriction ?? ''} onChange={e => onChange({ ...data, romRestriction: e.target.value })} className={inputCls} placeholder="مثال: لا تجاوز 90° ثني" />
      </Field>
      <Field label="حالة الجرح">
        <ChipGroup options={woundOptions} selected={woundSelected}
          onChange={keys => onChange({ ...data, woundStatus: JSON.stringify(keys) })} />
      </Field>
      <Field label="ملاحظات">
        <textarea rows={2} value={data.notes ?? ''} onChange={e => onChange({ ...data, notes: e.target.value })} className={textareaCls} />
      </Field>
    </div>
  );
}

function Step3({ data, onChange }: { data: StepRedFlagsDto; onChange: (d: StepRedFlagsDto) => void }) {
  const flagOptions = [
    { key: 'fracture_dislocation', label: '🦴 كسر / خلع' },
    { key: 'neuro_deficit', label: '🧠 عجز عصبي' },
    { key: 'saddle_anesthesia', label: '🚨 تخدر السرج' },
    { key: 'infection_signs', label: '🔴 علامات عدوى' },
    { key: 'dvt_pe', label: '🩸 DVT / PE' },
    { key: 'night_pain_weight_loss', label: '🌙 ألم ليلي + فقدان وزن' },
    { key: 'chest_pain_syncope', label: '💔 ألم صدر / إغماء' },
  ];
  const actionOptions = [
    { key: 'urgent_referral', label: 'إحالة عاجلة' },
    { key: 'emergency_protocol', label: 'بروتوكول طوارئ' },
    { key: 'surgeon_notified', label: 'إبلاغ الجراح' },
  ];
  const selected: string[] = data.flags ? JSON.parse(data.flags) : [];
  const actions: string[] = data.actionsTaken ? JSON.parse(data.actionsTaken) : [];
  const hasFlags = selected.length > 0;
  return (
    <div className="space-y-5">
      <Field label="الإنذارات الحمراء المكتشفة">
        <ChipGroup options={flagOptions} selected={selected}
          onChange={keys => onChange({ ...data, flags: JSON.stringify(keys), decision: keys.length > 0 ? 'Present' : 'None' })} />
      </Field>
      {hasFlags && (
        <>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm font-bold text-red-700 mb-2">⚠️ تم اكتشاف إنذارات حمراء — يجب اتخاذ إجراء فوري</p>
            <Field label="ملاحظات القرار">
              <textarea rows={2} value={data.decisionNotes ?? ''} onChange={e => onChange({ ...data, decisionNotes: e.target.value })} className={textareaCls} placeholder="وصف الحالة والقرار المتخذ..." />
            </Field>
          </div>
          <Field label="الإجراءات المتخذة">
            <ChipGroup options={actionOptions} selected={actions}
              onChange={keys => onChange({ ...data, actionsTaken: JSON.stringify(keys) })} />
          </Field>
          <Field label="ملاحظات الإجراءات">
            <textarea rows={2} value={data.actionNotes ?? ''} onChange={e => onChange({ ...data, actionNotes: e.target.value })} className={textareaCls} />
          </Field>
        </>
      )}
      {!hasFlags && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 font-medium">
          ✓ لم يتم اكتشاف أي إنذارات حمراء
        </div>
      )}
    </div>
  );
}

function Step4({ data, onChange }: { data: StepSubjectiveDto; onChange: (d: StepSubjectiveDto) => void }) {
  const funcOptions = [
    { key: 'adls', label: 'الأنشطة اليومية' }, { key: 'work', label: 'العمل' },
    { key: 'sport', label: 'الرياضة' }, { key: 'sleep', label: 'النوم' },
    { key: 'stairs', label: 'الدرج' }, { key: 'walking', label: 'المشي' },
  ];
  const screenOptions = [
    { key: 'trauma_7days', label: 'صدمة خلال 7 أيام' }, { key: 'fever', label: 'حمى' },
    { key: 'weight_loss', label: 'فقدان وزن غير مبرر' }, { key: 'cancer', label: 'تاريخ أورام' },
    { key: 'steroids', label: 'استخدام طويل للكورتيزون' }, { key: 'anticoagulants', label: 'مضادات التخثر' },
    { key: 'diabetes', label: 'سكري' }, { key: 'pregnancy', label: 'حمل' },
  ];
  const funcSelected: string[] = data.functionalLimits ? JSON.parse(data.functionalLimits) : [];
  const screenSelected: string[] = data.screeningFlags ? JSON.parse(data.screeningFlags) : [];
  return (
    <div className="space-y-4">
      <Field label="الشكوى الرئيسية" required>
        <textarea rows={3} value={data.chiefComplaint ?? ''} onChange={e => onChange({ ...data, chiefComplaint: e.target.value })} className={textareaCls} placeholder="صف الشكوى بكلمات المريض..." />
      </Field>
      <Field label="آلية الإصابة / بداية الأعراض">
        <textarea rows={2} value={data.onsetMechanism ?? ''} onChange={e => onChange({ ...data, onsetMechanism: e.target.value })} className={textareaCls} />
      </Field>
      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <p className="text-xs font-black text-gray-700">مقياس الألم (0–10)</p>
        <PainSlider label="الألم الحالي" value={data.painNow} onChange={v => onChange({ ...data, painNow: v })} />
        <PainSlider label="أفضل ألم" value={data.painBest} onChange={v => onChange({ ...data, painBest: v })} />
        <PainSlider label="أسوأ ألم" value={data.painWorst} onChange={v => onChange({ ...data, painWorst: v })} />
      </div>
      <div className="bg-gray-50 rounded-xl p-4 space-y-1">
        <p className="text-xs font-black text-gray-700 mb-2">نمط 24 ساعة</p>
        <Toggle label="ألم ليلي" value={data.nightPain} onChange={v => onChange({ ...data, nightPain: v })} />
        <Toggle label="تيبس صباحي" value={data.morningStiffness} onChange={v => onChange({ ...data, morningStiffness: v })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="العوامل المحرِّضة">
          <textarea rows={2} value={data.aggravatIngFactors ?? ''} onChange={e => onChange({ ...data, aggravatIngFactors: e.target.value })} className={textareaCls} placeholder="ما يزيد الألم..." />
        </Field>
        <Field label="العوامل المخففة">
          <textarea rows={2} value={data.easingFactors ?? ''} onChange={e => onChange({ ...data, easingFactors: e.target.value })} className={textareaCls} placeholder="ما يخفف الألم..." />
        </Field>
      </div>
      <Field label="القيود الوظيفية">
        <ChipGroup options={funcOptions} selected={funcSelected}
          onChange={keys => onChange({ ...data, functionalLimits: JSON.stringify(keys) })} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="إصابات سابقة">
          <textarea rows={2} value={data.previousInjuries ?? ''} onChange={e => onChange({ ...data, previousInjuries: e.target.value })} className={textareaCls} />
        </Field>
        <Field label="أدوية حالية">
          <textarea rows={2} value={data.medications ?? ''} onChange={e => onChange({ ...data, medications: e.target.value })} className={textareaCls} />
        </Field>
      </div>
      <Field label="علامات الفحص الأولي (Screening)">
        <ChipGroup options={screenOptions} selected={screenSelected}
          onChange={keys => onChange({ ...data, screeningFlags: JSON.stringify(keys) })} />
      </Field>
      <Field label="أهداف المريض">
        <textarea rows={2} value={data.patientGoals ?? ''} onChange={e => onChange({ ...data, patientGoals: e.target.value })} className={textareaCls} placeholder="ماذا يريد المريض تحقيقه؟" />
      </Field>
    </div>
  );
}

function Step5({ data, onChange }: { data: StepObjectiveDto; onChange: (d: StepObjectiveDto) => void }) {
  const funcTestOptions = [
    { key: 'equal', label: 'Equal' }, { key: 'step_down', label: 'Step Down' },
    { key: 'sit_to_stand', label: 'Sit to Stand' }, { key: 'reach', label: 'Reach' },
    { key: 'grip', label: 'Grip' }, { key: 'balance', label: 'Balance' },
  ];
  const ftSelected: string[] = data.functionalTests ? JSON.parse(data.functionalTests) : [];
  const romRows: RomRow[] = data.romData ? JSON.parse(data.romData) : [];
  const strRows: StrRow[] = data.strengthData ? JSON.parse(data.strengthData) : [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {[
          { key: 'posture', label: 'الوضعية (Posture)' },
          { key: 'swelling', label: 'التورم (Swelling)' },
          { key: 'redness', label: 'الاحمرار (Redness)' },
          { key: 'deformity', label: 'التشوه (Deformity)' },
          { key: 'gait', label: 'المشية (Gait)' },
          { key: 'transfers', label: 'التنقل (Transfers)' },
        ].map(f => (
          <Field key={f.key} label={f.label}>
            <input value={(data as any)[f.key] ?? ''} onChange={e => onChange({ ...data, [f.key]: e.target.value })} className={inputCls} placeholder="وصف..." />
          </Field>
        ))}
      </div>
      <Field label="الأجهزة المساعدة">
        <input value={data.assistiveDevices ?? ''} onChange={e => onChange({ ...data, assistiveDevices: e.target.value })} className={inputCls} placeholder="مثال: عكاز، جبيرة..." />
      </Field>
      <Field label="الاختبارات الوظيفية">
        <ChipGroup options={funcTestOptions} selected={ftSelected}
          onChange={keys => onChange({ ...data, functionalTests: JSON.stringify(keys) })} />
      </Field>
      <Field label="مدى الحركة (ROM)">
        <RomTable value={romRows} onChange={rows => onChange({ ...data, romData: JSON.stringify(rows) })} />
      </Field>
      <Field label="القوة العضلية (MMT)">
        <StrengthTable value={strRows} onChange={rows => onChange({ ...data, strengthData: JSON.stringify(rows) })} />
      </Field>
      <Field label="ملاحظات إضافية">
        <textarea rows={2} value={data.additionalNotes ?? ''} onChange={e => onChange({ ...data, additionalNotes: e.target.value })} className={textareaCls} />
      </Field>
    </div>
  );
}

function Step6({ data, onChange }: { data: StepNeuroDto; onChange: (d: StepNeuroDto) => void }) {
  const nvOptions = [
    { key: 'pulses', label: 'نبض' }, { key: 'cap_refill', label: 'إعادة الأوعية' },
    { key: 'temperature', label: 'درجة الحرارة' },
  ];
  const specialTestOptions = [
    { key: 'painful_arc', label: 'Painful Arc' }, { key: 'hawkins_kennedy', label: 'Hawkins-Kennedy' },
    { key: 'neer', label: 'Neer' }, { key: 'obrien', label: "O'Brien" },
    { key: 'lachman', label: 'Lachman' }, { key: 'mcmurray', label: 'McMurray' },
    { key: 'slr', label: 'SLR' }, { key: 'slump', label: 'Slump' },
    { key: 'spurling', label: 'Spurling' }, { key: 'phalen', label: 'Phalen' },
    { key: 'tinel', label: 'Tinel' },
  ];
  const nvSelected: string[] = data.neurovascularChecks ? JSON.parse(data.neurovascularChecks) : [];
  const stSelected: string[] = data.specialTests ? JSON.parse(data.specialTests) : [];
  return (
    <div className="space-y-4">
      {[
        { key: 'sensation', label: 'الإحساس (Sensation)' },
        { key: 'numbness', label: 'التخدر (Numbness)' },
        { key: 'tingling', label: 'التنميل (Tingling)' },
        { key: 'myotomes', label: 'Myotomes' },
        { key: 'keyMuscleWeakness', label: 'ضعف العضلات الرئيسية' },
        { key: 'reflexes', label: 'Reflexes' },
      ].map(f => (
        <Field key={f.key} label={f.label}>
          <input value={(data as any)[f.key] ?? ''} onChange={e => onChange({ ...data, [f.key]: e.target.value })} className={inputCls} placeholder="أدخل نتيجة الفحص..." />
        </Field>
      ))}
      <Field label="الفحص الوعائي العصبي">
        <ChipGroup options={nvOptions} selected={nvSelected}
          onChange={keys => onChange({ ...data, neurovascularChecks: JSON.stringify(keys) })} />
      </Field>
      <Field label="الاختبارات الخاصة (Special Tests)">
        <ChipGroup options={specialTestOptions} selected={stSelected}
          onChange={keys => onChange({ ...data, specialTests: JSON.stringify(keys) })} />
      </Field>
      <Field label="ملاحظات إضافية">
        <textarea rows={2} value={data.additionalNotes ?? ''} onChange={e => onChange({ ...data, additionalNotes: e.target.value })} className={textareaCls} />
      </Field>
    </div>
  );
}

function Step7({ data, onChange }: { data: StepClinicalReasoningDto; onChange: (d: StepClinicalReasoningDto) => void }) {
  const urgencyOptions = [
    { key: 'routine', label: 'روتيني' }, { key: 'urgent', label: 'عاجل' }, { key: 'emergency', label: 'طوارئ' },
  ];
  const severityOptions = [
    { key: 'Low/Acute', label: 'خفيف / حاد' }, { key: 'Low/Subacute', label: 'خفيف / تحت الحاد' },
    { key: 'Low/Chronic', label: 'خفيف / مزمن' }, { key: 'Moderate/Acute', label: 'معتدل / حاد' },
    { key: 'Moderate/Chronic', label: 'معتدل / مزمن' }, { key: 'High/Acute', label: 'شديد / حاد' },
  ];
  return (
    <div className="space-y-4">
      <Field label="قائمة المشاكل (Problem List)">
        <textarea rows={3} value={data.problemList ?? ''} onChange={e => onChange({ ...data, problemList: e.target.value })} className={textareaCls} placeholder="الضعف، القيود، العجز الوظيفي..." />
      </Field>
      <Field label="الفرضية العملية (Working Hypothesis)">
        <textarea rows={2} value={data.workingHypothesis ?? ''} onChange={e => onChange({ ...data, workingHypothesis: e.target.value })} className={textareaCls} placeholder="التشخيص المحتمل ومصدر الألم..." />
      </Field>
      <Field label="الشدة والاستثارة">
        <ChipGroup options={severityOptions} selected={data.severityIrritability ? [data.severityIrritability] : []}
          onChange={keys => onChange({ ...data, severityIrritability: keys[keys.length - 1] })} />
      </Field>
      <Field label="اعتبارات تشخيصية أخرى">
        <textarea rows={2} value={data.differentialConsiderations ?? ''} onChange={e => onChange({ ...data, differentialConsiderations: e.target.value })} className={textareaCls} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Toggle label="طلب تصوير (Imaging)" value={data.imagingRequested} onChange={v => onChange({ ...data, imagingRequested: v })} />
          {data.imagingRequested && (
            <input value={data.imagingReason ?? ''} onChange={e => onChange({ ...data, imagingReason: e.target.value })} className={inputCls + ' mt-2'} placeholder="سبب التصوير..." />
          )}
        </div>
        <div>
          <Toggle label="إحالة مطلوبة" value={data.referralRequired} onChange={v => onChange({ ...data, referralRequired: v })} />
          {data.referralRequired && (
            <>
              <input value={data.referralTo ?? ''} onChange={e => onChange({ ...data, referralTo: e.target.value })} className={inputCls + ' mt-2'} placeholder="إحالة إلى..." />
              <ChipGroup options={urgencyOptions} selected={data.urgency ? [data.urgency] : []}
                onChange={keys => onChange({ ...data, urgency: keys[keys.length - 1] })} />
            </>
          )}
        </div>
      </div>
      <Field label="نقاط اتخاذ القرار">
        <textarea rows={2} value={data.decisionPoints ?? ''} onChange={e => onChange({ ...data, decisionPoints: e.target.value })} className={textareaCls} placeholder="علاج محافظ / إحالة / تصعيد ما بعد العملية..." />
      </Field>
      <Field label="ملاحظات إضافية">
        <textarea rows={2} value={data.additionalNotes ?? ''} onChange={e => onChange({ ...data, additionalNotes: e.target.value })} className={textareaCls} />
      </Field>
    </div>
  );
}

// ─── Wizard Page ──────────────────────────────────────────────────────────────

export default function AssessmentWizardPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'ar';
  const appointmentId = params?.id as string;

  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [specialities, setSpecialities] = useState<ClinicSpecialityDto[]>([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [showPlanDrawer, setShowPlanDrawer] = useState(false);
  const [planCreating, setPlanCreating] = useState(false);
  const [planTitle, setPlanTitle] = useState('');
  const [planSessions, setPlanSessions] = useState('6');
  const [planStartDate, setPlanStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [planNotes, setPlanNotes] = useState('');

  // Step local state
  const [s1, setS1] = useState<CreateAssessmentRequest>({
    specialityId: '', hasPostOp: false,
  });
  const [s2, setS2] = useState<StepPostOpDto>({});
  const [s3, setS3] = useState<StepRedFlagsDto>({});
  const [s4, setS4] = useState<StepSubjectiveDto>({});
  const [s5, setS5] = useState<StepObjectiveDto>({});
  const [s6, setS6] = useState<StepNeuroDto>({});
  const [s7, setS7] = useState<StepClinicalReasoningDto>({});

  const flash = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  // Hydrate from existing assessment
  const hydrate = useCallback((a: AssessmentDetail) => {
    setS1({
      specialityId: a.specialityId,
      bodyRegionCategoryId: a.bodyRegionCategoryId,
      diagnosisId: a.diagnosisId,
      diagnosisFreeText: a.diagnosisFreeText,
      patientAge: a.patientAge,
      gender: a.gender,
      hasPostOp: a.hasPostOp,
      additionalNotes: a.additionalNotes,
    });
    if (a.postOp) setS2(a.postOp);
    if (a.redFlags) setS3(a.redFlags);
    if (a.subjective) setS4(a.subjective);
    if (a.objective) setS5(a.objective);
    if (a.neuro) setS6(a.neuro);
    if (a.clinicalReasoning) setS7(a.clinicalReasoning);
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [existingRaw, specsRaw] = await Promise.allSettled([
          assessmentService.getByAppointment(appointmentId),
          specialityService.getClinicSpecialities('00000000-0000-0000-0000-000000000000'), // will be replaced by tenant
        ]);

        // Try to get clinic's specialities via the clinic diagnoses endpoint instead
        try {
          const r = await fetch('/api/clinic/diagnoses/specialities', {
            headers: { Authorization: `Bearer ${(() => { try { const s = localStorage.getItem('auth-storage'); return s ? JSON.parse(s).state?.accessToken : ''; } catch { return ''; } })()}` }
          });
          if (r.ok) {
            const json = await r.json();
            setSpecialities(json.data || []);
          }
        } catch { /* fallback to empty */ }

        if (existingRaw.status === 'fulfilled' && existingRaw.value) {
          setAssessment(existingRaw.value);
          hydrate(existingRaw.value);
          if (existingRaw.value.status === 'Submitted') {
            setStep(7);
          }
        }
      } catch (e: any) {
        setError(e?.message || 'فشل في تحميل بيانات التقييم');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [appointmentId, hydrate]);

  // Fetch specialities properly via clinic diagnoses controller
  useEffect(() => {
    const loadSpecs = async () => {
      try {
        const { apiClient } = await import('@/services/api-client');
        const r = await apiClient.get<{ data: ClinicSpecialityDto[] }>('/api/clinic/diagnoses/specialities');
        setSpecialities(r.data.data || []);
      } catch { /* silent */ }
    };
    loadSpecs();
  }, []);

  const isSubmitted = assessment?.status === 'Submitted';

  const saveCurrentStep = async (): Promise<AssessmentDetail | null> => {
    if (!assessment) return null;
    setSaving(true);
    try {
      let updated: AssessmentDetail;
      if (step === 1) {
        updated = await assessmentService.saveStep(assessment.id, 1, s1);
      } else if (step === 2) {
        updated = await assessmentService.saveStep(assessment.id, 2, s2);
      } else if (step === 3) {
        updated = await assessmentService.saveStep(assessment.id, 3, s3);
      } else if (step === 4) {
        updated = await assessmentService.saveStep(assessment.id, 4, s4);
      } else if (step === 5) {
        updated = await assessmentService.saveStep(assessment.id, 5, s5);
      } else if (step === 6) {
        updated = await assessmentService.saveStep(assessment.id, 6, s6);
      } else {
        updated = await assessmentService.saveStep(assessment.id, 7, s7);
      }
      setAssessment(updated);
      hydrate(updated);
      flash('تم حفظ الخطوة', true);
      return updated;
    } catch (e: any) {
      flash(e?.response?.data?.message || 'فشل في الحفظ', false);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleStart = async () => {
    if (!s1.specialityId) { flash('يرجى اختيار التخصص', false); return; }
    setSaving(true);
    try {
      const a = await assessmentService.start(appointmentId, s1);
      setAssessment(a);
      hydrate(a);
      flash('تم بدء التقييم', true);
      setStep(s1.hasPostOp ? 2 : 3);
    } catch (e: any) {
      flash(e?.response?.data?.message || 'فشل في بدء التقييم', false);
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (!assessment) { await handleStart(); return; }
    const saved = await saveCurrentStep();
    if (!saved) return;
    const next = step === 2 && !s1.hasPostOp ? 3 :
                 step === 1 && !s1.hasPostOp ? 3 :
                 Math.min(step + 1, 7);
    setStep(next);
  };

  const handleBack = () => {
    const prev = step === 3 && !s1.hasPostOp ? 1 : Math.max(step - 1, 1);
    setStep(prev);
  };

  const handleSaveAndExit = async () => {
    if (assessment) await saveCurrentStep();
    router.push(`/${locale}/clinic/appointments/${appointmentId}`);
  };

  const handleCreatePlan = async () => {
    if (!assessment || !planTitle.trim()) { flash('يرجى إدخال عنوان الخطة', false); return; }
    setPlanCreating(true);
    try {
      const plan = await treatmentPlansService.create({
        patientId: assessment.patientId,
        title: planTitle.trim(),
        diagnosis: assessment.diagnosisNameAr || assessment.diagnosisFreeText,
        startDate: planStartDate,
        totalSessionsPlanned: parseInt(planSessions) || 6,
        notes: planNotes.trim() || undefined,
      });
      flash('تم إنشاء خطة العلاج ✓', true);
      setShowPlanDrawer(false);
      setTimeout(() => router.push(`/${locale}/clinic/treatment-plans/${plan.id}`), 1000);
    } catch (e: any) {
      flash(e?.response?.data?.message || 'فشل في إنشاء الخطة', false);
    } finally {
      setPlanCreating(false);
    }
  };

  const handleSubmit = async () => {
    if (!assessment) return;
    const saved = await saveCurrentStep();
    if (!saved) return;
    setSubmitting(true);
    try {
      const submitted = await assessmentService.submit(assessment.id);
      setAssessment(submitted);
      flash('تم تقديم التقييم بنجاح ✓', true);
      setTimeout(() => router.push(`/${locale}/clinic/appointments/${appointmentId}`), 1500);
    } catch (e: any) {
      flash(e?.response?.data?.message || 'فشل في تقديم التقييم', false);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Active steps (skip step 2 if no post-op) ─────────────────────────────
  const activeSteps = STEPS.filter(s => s.n !== 2 || s1.hasPostOp);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-28 gap-3" dir="rtl">
      <div className="w-10 h-10 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
      <span className="text-sm text-gray-400">جاري تحميل التقييم...</span>
    </div>
  );

  if (error) return (
    <div className="space-y-4" dir="rtl">
      <button onClick={() => router.push(`/${locale}/clinic/appointments/${appointmentId}`)}
        className="text-gray-400 hover:text-purple-500 text-sm">← العودة للموعد</button>
      <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-4 text-sm">{error}</div>
    </div>
  );

  const currentStepInfo = STEPS.find(s => s.n === step)!;
  const isLastStep = step === 7;
  const stepIdx = activeSteps.findIndex(s => s.n === step);

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.push(`/${locale}/clinic/appointments/${appointmentId}`)}
            className="text-gray-400 hover:text-purple-600 text-sm font-semibold flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            العودة للموعد
          </button>
          <div className="flex items-center gap-2">
            {isSubmitted && (
              <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200">
                ✓ مُقدَّم
              </span>
            )}
            {!isSubmitted && assessment && (
              <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
                مسودة
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-purple-100 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-black text-gray-900">تقييم SOAP الطبي</h1>
            <p className="text-xs text-gray-400 mt-0.5">الخطوة {step} من {activeSteps.length} — {currentStepInfo.label}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5">
          {activeSteps.map((s, i) => (
            <button key={s.n} onClick={() => assessment && setStep(s.n)} disabled={!assessment && s.n > 1}
              className={`flex-1 h-2 rounded-full transition-colors ${
                s.n === step ? 'bg-purple-500' :
                i < stepIdx ? 'bg-purple-200' :
                'bg-gray-100'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1.5">
          {activeSteps.map((s, i) => (
            <span key={s.n} className={`text-[10px] font-medium ${
              s.n === step ? 'text-purple-600' : i < stepIdx ? 'text-purple-300' : 'text-gray-300'
            }`}>
              {i + 1}
            </span>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="text-sm font-black text-gray-800 mb-4 pb-3 border-b border-gray-100">
          {step}. {currentStepInfo.label}
        </h2>

        {isSubmitted ? (
          <div className="py-6 text-center space-y-5">
            <div className="flex flex-col items-center gap-2 text-green-600">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-2xl">✓</div>
              <p className="font-black text-gray-800">تم تقديم هذا التقييم</p>
              <p className="text-xs text-gray-400">لا يمكن تعديله بعد التقديم</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              {assessment && (
                <Link
                  href={`/${locale}/clinic/assessments/${assessment.id}`}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#E8F5FF] text-[#29AAFE] text-sm font-bold hover:bg-[#29AAFE] hover:text-white transition-colors"
                >
                  📄 عرض التقرير الكامل
                </Link>
              )}
              <button
                onClick={() => {
                  if (assessment) {
                    setPlanTitle(assessment.diagnosisNameAr || assessment.diagnosisFreeText || 'خطة علاج');
                  }
                  setShowPlanDrawer(true);
                }}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold transition-colors"
              >
                📋 إنشاء خطة علاج
              </button>
            </div>
          </div>
        ) : (
          <>
            {step === 1 && <Step1 data={s1} onChange={setS1} specialities={specialities} />}
            {step === 2 && <Step2 data={s2} onChange={setS2} />}
            {step === 3 && <Step3 data={s3} onChange={setS3} />}
            {step === 4 && <Step4 data={s4} onChange={setS4} />}
            {step === 5 && <Step5 data={s5} onChange={setS5} />}
            {step === 6 && <Step6 data={s6} onChange={setS6} />}
            {step === 7 && <Step7 data={s7} onChange={setS7} />}
          </>
        )}
      </div>

      {/* Footer nav */}
      {!isSubmitted && (
        <div className="bg-white rounded-2xl shadow-sm px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex gap-2">
            {step > 1 && (
              <button onClick={handleBack}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                → السابق
              </button>
            )}
            <button onClick={handleSaveAndExit} disabled={saving}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50">
              حفظ والخروج
            </button>
          </div>

          <div className="flex gap-2">
            {assessment && !isLastStep && (
              <button onClick={() => saveCurrentStep()} disabled={saving}
                className="px-4 py-2.5 rounded-xl border border-purple-200 text-purple-600 text-sm font-bold hover:bg-purple-50 transition-colors disabled:opacity-50">
                {saving ? '...' : 'حفظ'}
              </button>
            )}
            {isLastStep ? (
              <button onClick={handleSubmit} disabled={submitting || saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-black transition-colors disabled:opacity-60 shadow-sm">
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : '✓'}
                تقديم التقييم
              </button>
            ) : (
              <button onClick={handleNext} disabled={saving || submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-black transition-colors disabled:opacity-60 shadow-sm">
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : null}
                {!assessment && step === 1 ? 'بدء التقييم' : 'التالي ←'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-bold text-white transition-all
          ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.ok ? '✓' : '✕'} {toast.msg}
        </div>
      )}

      {/* Create Plan Drawer */}
      {showPlanDrawer && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowPlanDrawer(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col" dir="rtl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-black text-gray-800 text-base">إنشاء خطة علاج</h2>
              <button onClick={() => setShowPlanDrawer(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">عنوان الخطة <span className="text-red-500">*</span></label>
                <input
                  value={planTitle}
                  onChange={e => setPlanTitle(e.target.value)}
                  placeholder="مثال: خطة علاج الكتف"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#29AAFE] focus:ring-1 focus:ring-[#29AAFE]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">تاريخ البدء</label>
                <input
                  type="date"
                  value={planStartDate}
                  onChange={e => setPlanStartDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#29AAFE] focus:ring-1 focus:ring-[#29AAFE]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">عدد الجلسات المخططة</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={planSessions}
                  onChange={e => setPlanSessions(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#29AAFE] focus:ring-1 focus:ring-[#29AAFE]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">ملاحظات</label>
                <textarea
                  rows={3}
                  value={planNotes}
                  onChange={e => setPlanNotes(e.target.value)}
                  placeholder="أهداف الخطة، توقعات التعافي..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#29AAFE] focus:ring-1 focus:ring-[#29AAFE]/20 resize-none"
                />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowPlanDrawer(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleCreatePlan}
                disabled={planCreating || !planTitle.trim()}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
              >
                {planCreating ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : null}
                {planCreating ? 'جاري الإنشاء...' : 'إنشاء الخطة'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
