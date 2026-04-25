'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { assessmentService } from '@/domains/assessment';
import type { AssessmentDetail } from '@/domains/assessment';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso?: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ─── Print-only sub-components ────────────────────────────────────────────────

function PrintSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 print:mb-4 break-inside-avoid">
      <h3 className="text-sm font-black text-gray-800 border-b-2 border-gray-800 pb-1 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function PrintRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex gap-2 mb-1.5 text-xs">
      <span className="font-bold text-gray-600 shrink-0 w-40">{label}:</span>
      <span className="text-gray-800">{String(value)}</span>
    </div>
  );
}

interface RomRow { movement: string; active: string; passive: string; normal: string; pain: boolean; }
interface StrRow { muscle: string; grade: string; notes: string; }

function PrintRomTable({ data }: { data: string }) {
  let rows: RomRow[] = [];
  try { rows = JSON.parse(data); } catch { return <p className="text-xs text-gray-500">{data}</p>; }
  if (!rows.length) return null;
  return (
    <table className="w-full text-xs text-right border-collapse mb-2">
      <thead>
        <tr className="bg-gray-100">
          {['الحركة', 'نشط', 'سلبي', 'طبيعي', 'ألم'].map(h => (
            <th key={h} className="border border-gray-300 px-2 py-1 font-bold text-gray-600">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td className="border border-gray-300 px-2 py-1 font-medium">{r.movement}</td>
            <td className="border border-gray-300 px-2 py-1">{r.active}</td>
            <td className="border border-gray-300 px-2 py-1">{r.passive}</td>
            <td className="border border-gray-300 px-2 py-1">{r.normal}</td>
            <td className="border border-gray-300 px-2 py-1 text-center">{r.pain ? '✓' : ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PrintStrTable({ data }: { data: string }) {
  let rows: StrRow[] = [];
  try { rows = JSON.parse(data); } catch { return <p className="text-xs text-gray-500">{data}</p>; }
  if (!rows.length) return null;
  return (
    <table className="w-full text-xs text-right border-collapse mb-2">
      <thead>
        <tr className="bg-gray-100">
          {['العضلة', 'الدرجة', 'ملاحظات'].map(h => (
            <th key={h} className="border border-gray-300 px-2 py-1 font-bold text-gray-600">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td className="border border-gray-300 px-2 py-1 font-medium">{r.muscle}</td>
            <td className="border border-gray-300 px-2 py-1">{r.grade}</td>
            <td className="border border-gray-300 px-2 py-1">{r.notes}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AssessmentPrintPage() {
  const params = useParams();
  const assessmentId = params?.id as string;

  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    assessmentService.getById(assessmentId)
      .then(d => { setAssessment(d); })
      .catch(e => setError(e?.message || 'فشل في تحميل التقييم'))
      .finally(() => setLoading(false));
  }, [assessmentId]);

  // Auto-print when loaded
  useEffect(() => {
    if (!loading && assessment) {
      const timer = setTimeout(() => window.print(), 600);
      return () => clearTimeout(timer);
    }
  }, [loading, assessment]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400 text-sm" dir="rtl">
        جاري تحضير التقرير للطباعة...
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500 text-sm" dir="rtl">
        {error ?? 'التقييم غير موجود'}
      </div>
    );
  }

  const a = assessment;

  return (
    <>
      {/* Print button — hidden when printing */}
      <div className="print:hidden fixed top-4 left-4 z-10 flex gap-2">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-gray-800 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition-colors"
        >
          🖨️ طباعة
        </button>
        <button
          onClick={() => window.close()}
          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors"
        >
          إغلاق
        </button>
      </div>

      <style>{`
        @media print {
          body { margin: 0; }
          @page { margin: 1.5cm; size: A4; }
        }
      `}</style>

      {/* Report body */}
      <div
        dir="rtl"
        className="max-w-3xl mx-auto px-8 py-10 print:px-0 print:py-0 font-sans text-gray-900"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-4 border-b-2 border-gray-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded bg-[#29AAFE] flex items-center justify-center text-white font-black text-sm print:bg-gray-800">R</div>
              <span className="text-base font-black">Rehably</span>
            </div>
            <p className="text-xs text-gray-400">نظام إدارة العيادات الطبية</p>
          </div>
          <div className="text-left text-xs text-gray-600 space-y-0.5">
            <div className="text-base font-black text-gray-800 mb-1">تقرير التقييم SOAP</div>
            <div>تاريخ الإنشاء: {fmtDate(a.createdAt)}</div>
            {a.submittedAt && <div>تاريخ التقديم: {fmtDate(a.submittedAt)}</div>}
            <div>الرقم المرجعي: <span className="font-mono text-gray-500">{a.id.slice(0, 8).toUpperCase()}</span></div>
          </div>
        </div>

        {/* Patient & assessment meta */}
        <div className="grid grid-cols-2 gap-6 mb-6 text-xs">
          <div className="space-y-1.5">
            <div className="font-black text-gray-700 mb-2 text-sm">معلومات التقييم</div>
            {a.specialityNameAr && <div><span className="font-bold text-gray-500">التخصص: </span>{a.specialityNameAr}</div>}
            {(a.diagnosisNameAr || a.diagnosisFreeText) && (
              <div><span className="font-bold text-gray-500">التشخيص: </span>{a.diagnosisNameAr || a.diagnosisFreeText}</div>
            )}
            {a.therapistName && <div><span className="font-bold text-gray-500">المعالج: </span>{a.therapistName}</div>}
          </div>
          <div className="space-y-1.5">
            <div className="font-black text-gray-700 mb-2 text-sm">بيانات المريض</div>
            {a.patientAge && <div><span className="font-bold text-gray-500">العمر: </span>{a.patientAge} سنة</div>}
            {a.gender && <div><span className="font-bold text-gray-500">الجنس: </span>{a.gender === 'Male' ? 'ذكر' : 'أنثى'}</div>}
            <div><span className="font-bold text-gray-500">ما بعد الجراحة: </span>{a.hasPostOp ? 'نعم' : 'لا'}</div>
          </div>
        </div>

        {/* Post-op */}
        {a.hasPostOp && a.postOp && (
          <PrintSection title="ما بعد الجراحة">
            <PrintRow label="اسم الإجراء"            value={a.postOp.procedureName} />
            <PrintRow label="الجانب"                  value={a.postOp.procedureSide} />
            <PrintRow label="تاريخ الجراحة"           value={fmtDate(a.postOp.surgeryDate)} />
            <PrintRow label="أيام ما بعد الجراحة"     value={a.postOp.daysPostOp} />
            <PrintRow label="الجراح / المنشأة"        value={a.postOp.surgeonFacility} />
            <PrintRow label="حالة تحمل الوزن"         value={a.postOp.weightBearingStatus} />
            <PrintRow label="قيود ROM"                value={a.postOp.romRestriction} />
            <PrintRow label="احتياطات ما بعد الجراحة" value={a.postOp.postOpPrecautions} />
            <PrintRow label="حالة الجرح"              value={a.postOp.woundStatus} />
            <PrintRow label="ملاحظات"                 value={a.postOp.notes} />
          </PrintSection>
        )}

        {/* Red flags */}
        {a.redFlags && (a.redFlags.flags || a.redFlags.decision) && (
          <PrintSection title="العلامات التحذيرية">
            <PrintRow label="العلامات"         value={a.redFlags.flags} />
            <PrintRow label="القرار"           value={a.redFlags.decision} />
            <PrintRow label="ملاحظات القرار"  value={a.redFlags.decisionNotes} />
            <PrintRow label="الإجراءات"        value={a.redFlags.actionsTaken} />
          </PrintSection>
        )}

        {/* Subjective */}
        {a.subjective && (
          <PrintSection title="الشكاوى الذاتية (S)">
            <PrintRow label="الشكوى الرئيسية"  value={a.subjective.chiefComplaint} />
            <PrintRow label="آلية الإصابة"     value={a.subjective.onsetMechanism} />
            {(a.subjective.painNow !== undefined || a.subjective.painBest !== undefined || a.subjective.painWorst !== undefined) && (
              <PrintRow
                label="شدة الألم (الآن/أفضل/أسوأ)"
                value={`${a.subjective.painNow ?? '—'} / ${a.subjective.painBest ?? '—'} / ${a.subjective.painWorst ?? '—'}`}
              />
            )}
            <PrintRow label="ألم ليلي"          value={a.subjective.nightPain ? 'نعم' : null} />
            <PrintRow label="تيبس صباحي"        value={a.subjective.morningStiffness ? 'نعم' : null} />
            <PrintRow label="نمط الألم"         value={a.subjective.painPattern24h} />
            <PrintRow label="عوامل التفاقم"     value={a.subjective.aggravatIngFactors} />
            <PrintRow label="عوامل التخفيف"     value={a.subjective.easingFactors} />
            <PrintRow label="القيود الوظيفية"   value={a.subjective.functionalLimits} />
            <PrintRow label="التاريخ المرضي"    value={a.subjective.medicalHistory} />
            <PrintRow label="الأدوية"           value={a.subjective.medications} />
            <PrintRow label="أهداف المريض"      value={a.subjective.patientGoals} />
          </PrintSection>
        )}

        {/* Objective */}
        {a.objective && (
          <PrintSection title="الفحص الموضوعي (O)">
            <PrintRow label="الوضعية"            value={a.objective.posture} />
            <PrintRow label="التورم"              value={a.objective.swelling} />
            <PrintRow label="الاحمرار"            value={a.objective.redness} />
            <PrintRow label="التشوه"              value={a.objective.deformity} />
            <PrintRow label="المشية"              value={a.objective.gait} />
            <PrintRow label="الأجهزة المساعدة"   value={a.objective.assistiveDevices} />
            <PrintRow label="الاختبارات الوظيفية" value={a.objective.functionalTests} />
            {a.objective.romData && (
              <div className="mt-2">
                <div className="text-xs font-bold text-gray-600 mb-1">مدى الحركة (ROM):</div>
                <PrintRomTable data={a.objective.romData} />
              </div>
            )}
            {a.objective.strengthData && (
              <div className="mt-2">
                <div className="text-xs font-bold text-gray-600 mb-1">القوة العضلية:</div>
                <PrintStrTable data={a.objective.strengthData} />
              </div>
            )}
          </PrintSection>
        )}

        {/* Neuro */}
        {a.neuro && (
          <PrintSection title="الفحص العصبي (N)">
            <PrintRow label="الحساسية"          value={a.neuro.sensation} />
            <PrintRow label="التخدر"            value={a.neuro.numbness} />
            <PrintRow label="التنميل"           value={a.neuro.tingling} />
            <PrintRow label="الميوتومات"        value={a.neuro.myotomes} />
            <PrintRow label="ضعف العضلات"       value={a.neuro.keyMuscleWeakness} />
            <PrintRow label="المنعكسات"         value={a.neuro.reflexes} />
            <PrintRow label="الفحوصات الوعائية" value={a.neuro.neurovascularChecks} />
            <PrintRow label="الاختبارات الخاصة" value={a.neuro.specialTests} />
          </PrintSection>
        )}

        {/* Clinical reasoning */}
        {a.clinicalReasoning && (
          <PrintSection title="التفكير السريري (A/P)">
            <PrintRow label="قائمة المشاكل"     value={a.clinicalReasoning.problemList} />
            <PrintRow label="الفرضية العاملة"   value={a.clinicalReasoning.workingHypothesis} />
            <PrintRow label="الشدة والاستثارة"  value={a.clinicalReasoning.severityIrritability} />
            <PrintRow label="التفاضل التشخيصي" value={a.clinicalReasoning.differentialConsiderations} />
            <PrintRow label="نقاط القرار"       value={a.clinicalReasoning.decisionPoints} />
            {a.clinicalReasoning.imagingRequested && (
              <PrintRow label="طلب تصوير" value={`نعم${a.clinicalReasoning.imagingReason ? ` — ${a.clinicalReasoning.imagingReason}` : ''}`} />
            )}
            {a.clinicalReasoning.referralRequired && (
              <PrintRow label="إحالة" value={`${a.clinicalReasoning.referralTo ?? ''}${a.clinicalReasoning.urgency ? ` (${a.clinicalReasoning.urgency})` : ''}`} />
            )}
          </PrintSection>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300 flex justify-between text-xs text-gray-400">
          <span>Rehably — نظام إدارة العيادات</span>
          <span>تاريخ الطباعة: {new Date().toLocaleDateString('ar-SA')}</span>
        </div>
      </div>
    </>
  );
}
