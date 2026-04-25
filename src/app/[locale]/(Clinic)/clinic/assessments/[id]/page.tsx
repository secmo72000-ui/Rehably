'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { assessmentService } from '@/domains/assessment';
import { treatmentPlansService } from '@/domains/treatment-plans/treatment-plans.service';
import type { AssessmentDetail } from '@/domains/assessment';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso?: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 bg-gray-50 border-b border-gray-100">
        <span className="text-base">{icon}</span>
        <h3 className="font-black text-gray-800 text-sm">{title}</h3>
      </div>
      <div className="px-5 py-4 space-y-3">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === '' || value === false) return null;
  const display = typeof value === 'boolean' ? 'نعم' : String(value);
  return (
    <div className="flex gap-3 py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 font-semibold shrink-0 w-36">{label}</span>
      <span className="text-sm text-gray-700 font-medium">{display}</span>
    </div>
  );
}

function PainBadge({ val }: { val?: number }) {
  if (val === undefined || val === null) return <span className="text-gray-400">—</span>;
  const colors = ['bg-green-500','bg-green-400','bg-lime-400','bg-yellow-400','bg-yellow-500',
    'bg-orange-400','bg-orange-500','bg-red-400','bg-red-500','bg-red-600','bg-red-700'];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-black text-white ${colors[val]}`}>
      {val} / 10
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AssessmentViewPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'ar';
  const assessmentId = params?.id as string;

  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Plan creation state
  const [showPlanDrawer, setShowPlanDrawer] = useState(false);
  const [planCreating, setPlanCreating] = useState(false);
  const [planTitle, setPlanTitle] = useState('');
  const [planSessions, setPlanSessions] = useState('6');
  const [planStartDate, setPlanStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [planNotes, setPlanNotes] = useState('');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    assessmentService.getById(assessmentId)
      .then(setAssessment)
      .catch(e => setError(e?.message || 'فشل في تحميل التقييم'))
      .finally(() => setLoading(false));
  }, [assessmentId]);

  const flash = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-3" dir="rtl">
        <div className="w-10 h-10 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
        <span className="text-sm text-gray-400">جاري تحميل التقييم...</span>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="space-y-4" dir="rtl">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-purple-500 text-sm">← رجوع</button>
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-4 text-sm">{error ?? 'التقييم غير موجود'}</div>
      </div>
    );
  }

  const a = assessment;
  const isSubmitted = a.status === 'Submitted';

  return (
    <div className="space-y-5 max-w-3xl" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-gray-400 hover:text-purple-600 text-sm transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          رجوع
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
            isSubmitted ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
          }`}>
            {isSubmitted ? '✓ مُقدَّم' : 'مسودة'}
          </span>

          <Link
            href={`/${locale}/clinic/assessments/${a.id}/print`}
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
          >
            🖨️ طباعة
          </Link>

          {isSubmitted && (
            <button
              onClick={() => {
                setPlanTitle(a.diagnosisNameAr || a.diagnosisFreeText || 'خطة علاج');
                setShowPlanDrawer(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors"
            >
              📋 إنشاء خطة علاج
            </button>
          )}
        </div>
      </div>

      {/* Title card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-purple-100 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-black text-gray-900">تقييم SOAP الطبي</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {a.diagnosisNameAr || a.diagnosisFreeText || 'تقييم شامل'}
              {a.specialityNameAr && ` — ${a.specialityNameAr}`}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-gray-500">
          {a.therapistName && (
            <div><span className="text-gray-400">المعالج: </span>{a.therapistName}</div>
          )}
          <div><span className="text-gray-400">أُنشئ: </span>{fmtDate(a.createdAt)}</div>
          {a.submittedAt && (
            <div><span className="text-gray-400">مُقدَّم: </span>{fmtDate(a.submittedAt)}</div>
          )}
          {a.patientAge && (
            <div><span className="text-gray-400">العمر: </span>{a.patientAge} سنة</div>
          )}
          {a.gender && (
            <div><span className="text-gray-400">الجنس: </span>{a.gender === 'Male' ? 'ذكر' : 'أنثى'}</div>
          )}
        </div>
      </div>

      {/* Step 1: Patient info */}
      <Section title="بيانات المريض" icon="👤">
        <Row label="التخصص"         value={a.specialityNameAr} />
        <Row label="التشخيص"        value={a.diagnosisNameAr || a.diagnosisFreeText} />
        <Row label="العمر"           value={a.patientAge ? `${a.patientAge} سنة` : null} />
        <Row label="الجنس"           value={a.gender === 'Male' ? 'ذكر' : a.gender === 'Female' ? 'أنثى' : null} />
        <Row label="ما بعد الجراحة" value={a.hasPostOp ? 'نعم' : null} />
        <Row label="ملاحظات إضافية" value={a.additionalNotes} />
      </Section>

      {/* Step 2: Post-op */}
      {a.hasPostOp && a.postOp && (
        <Section title="ما بعد الجراحة" icon="🩹">
          <Row label="اسم الإجراء"         value={a.postOp.procedureName} />
          <Row label="الجانب"               value={a.postOp.procedureSide} />
          <Row label="تاريخ الجراحة"        value={fmtDate(a.postOp.surgeryDate)} />
          <Row label="أيام ما بعد الجراحة"  value={a.postOp.daysPostOp} />
          <Row label="الجراح / المنشأة"     value={a.postOp.surgeonFacility} />
          <Row label="حالة تحمل الوزن"      value={a.postOp.weightBearingStatus} />
          <Row label="قيود ROM"             value={a.postOp.romRestriction} />
          <Row label="احتياطات ما بعد الجراحة" value={a.postOp.postOpPrecautions} />
          <Row label="حالة الجرح"           value={a.postOp.woundStatus} />
          <Row label="ملاحظات"              value={a.postOp.notes} />
        </Section>
      )}

      {/* Step 3: Red flags */}
      {a.redFlags && (
        <Section title="العلامات التحذيرية" icon="🚨">
          <Row label="العلامات"        value={a.redFlags.flags} />
          <Row label="القرار"          value={a.redFlags.decision} />
          <Row label="ملاحظات القرار" value={a.redFlags.decisionNotes} />
          <Row label="الإجراءات"       value={a.redFlags.actionsTaken} />
          <Row label="ملاحظات الإجراء" value={a.redFlags.actionNotes} />
        </Section>
      )}

      {/* Step 4: Subjective */}
      {a.subjective && (
        <Section title="الشكاوى الذاتية" icon="🗣️">
          <Row label="الشكوى الرئيسية"    value={a.subjective.chiefComplaint} />
          <Row label="آلية الإصابة"        value={a.subjective.onsetMechanism} />
          <div className="flex flex-wrap gap-4 py-1.5 border-b border-gray-50">
            <span className="text-xs text-gray-400 font-semibold w-36 shrink-0">شدة الألم</span>
            <div className="flex gap-3 flex-wrap">
              <span className="text-xs text-gray-500">الآن: <PainBadge val={a.subjective.painNow} /></span>
              <span className="text-xs text-gray-500">الأفضل: <PainBadge val={a.subjective.painBest} /></span>
              <span className="text-xs text-gray-500">الأسوأ: <PainBadge val={a.subjective.painWorst} /></span>
            </div>
          </div>
          <Row label="ألم ليلي"            value={a.subjective.nightPain ? 'نعم' : null} />
          <Row label="تيبس صباحي"          value={a.subjective.morningStiffness ? 'نعم' : null} />
          <Row label="نمط الألم 24 ساعة"   value={a.subjective.painPattern24h} />
          <Row label="عوامل التفاقم"        value={a.subjective.aggravatIngFactors} />
          <Row label="عوامل التخفيف"        value={a.subjective.easingFactors} />
          <Row label="القيود الوظيفية"      value={a.subjective.functionalLimits} />
          <Row label="إصابات سابقة"         value={a.subjective.previousInjuries} />
          <Row label="التاريخ المرضي"       value={a.subjective.medicalHistory} />
          <Row label="الأدوية"              value={a.subjective.medications} />
          <Row label="أهداف المريض"         value={a.subjective.patientGoals} />
          <Row label="ملاحظات إضافية"       value={a.subjective.additionalNotes} />
        </Section>
      )}

      {/* Step 5: Objective */}
      {a.objective && (
        <Section title="الفحص الموضوعي" icon="👁️">
          <Row label="الوضعية"         value={a.objective.posture} />
          <Row label="التورم"           value={a.objective.swelling} />
          <Row label="الاحمرار"         value={a.objective.redness} />
          <Row label="التشوه"           value={a.objective.deformity} />
          <Row label="المشية"           value={a.objective.gait} />
          <Row label="التحويلات"        value={a.objective.transfers} />
          <Row label="الأجهزة المساعدة" value={a.objective.assistiveDevices} />
          <Row label="الاختبارات الوظيفية" value={a.objective.functionalTests} />
          {a.objective.romData && (
            <div className="py-1.5 border-b border-gray-50">
              <span className="text-xs text-gray-400 font-semibold block mb-2">مدى الحركة (ROM)</span>
              <RomTable data={a.objective.romData} />
            </div>
          )}
          {a.objective.strengthData && (
            <div className="py-1.5 border-b border-gray-50">
              <span className="text-xs text-gray-400 font-semibold block mb-2">القوة العضلية</span>
              <StrengthTable data={a.objective.strengthData} />
            </div>
          )}
          <Row label="ملاحظات إضافية" value={a.objective.additionalNotes} />
        </Section>
      )}

      {/* Step 6: Neuro */}
      {a.neuro && (
        <Section title="الفحص العصبي" icon="🧠">
          <Row label="الحساسية"          value={a.neuro.sensation} />
          <Row label="التخدر"            value={a.neuro.numbness} />
          <Row label="التنميل"           value={a.neuro.tingling} />
          <Row label="الميوتومات"        value={a.neuro.myotomes} />
          <Row label="ضعف العضلات الرئيسية" value={a.neuro.keyMuscleWeakness} />
          <Row label="المنعكسات"         value={a.neuro.reflexes} />
          <Row label="الفحوصات الوعائية العصبية" value={a.neuro.neurovascularChecks} />
          <Row label="الاختبارات الخاصة" value={a.neuro.specialTests} />
          <Row label="ملاحظات إضافية"   value={a.neuro.additionalNotes} />
        </Section>
      )}

      {/* Step 7: Clinical reasoning */}
      {a.clinicalReasoning && (
        <Section title="التفكير السريري" icon="📋">
          <Row label="قائمة المشاكل"      value={a.clinicalReasoning.problemList} />
          <Row label="الفرضية العاملة"    value={a.clinicalReasoning.workingHypothesis} />
          <Row label="الشدة والاستثارة"   value={a.clinicalReasoning.severityIrritability} />
          <Row label="التفاضل التشخيصي"  value={a.clinicalReasoning.differentialConsiderations} />
          <Row label="نقاط القرار"        value={a.clinicalReasoning.decisionPoints} />
          <Row label="طلب تصوير"          value={a.clinicalReasoning.imagingRequested ? 'نعم' : null} />
          <Row label="سبب التصوير"        value={a.clinicalReasoning.imagingReason} />
          <Row label="إحالة مطلوبة"       value={a.clinicalReasoning.referralRequired ? 'نعم' : null} />
          <Row label="إحالة إلى"          value={a.clinicalReasoning.referralTo} />
          <Row label="الاستعجال"          value={a.clinicalReasoning.urgency} />
          <Row label="ملاحظات إضافية"    value={a.clinicalReasoning.additionalNotes} />
        </Section>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-bold text-white ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>
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
                {planCreating ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                {planCreating ? 'جاري الإنشاء...' : 'إنشاء الخطة'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── ROM table ─────────────────────────────────────────────────────────────────

interface RomRow { movement: string; active: string; passive: string; normal: string; pain: boolean; }
interface StrRow { muscle: string; grade: string; notes: string; }

function RomTable({ data }: { data: string }) {
  let rows: RomRow[] = [];
  try { rows = JSON.parse(data); } catch { return <p className="text-xs text-gray-500">{data}</p>; }
  if (!rows.length) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs text-right border-collapse">
        <thead>
          <tr className="bg-gray-50">
            {['الحركة', 'نشط', 'سلبي', 'طبيعي', 'ألم'].map(h => (
              <th key={h} className="px-2 py-1.5 font-bold text-gray-500 border border-gray-100">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border border-gray-100">
              <td className="px-2 py-1.5 font-medium text-gray-700 border border-gray-100">{r.movement}</td>
              <td className="px-2 py-1.5 text-gray-600 border border-gray-100">{r.active}</td>
              <td className="px-2 py-1.5 text-gray-600 border border-gray-100">{r.passive}</td>
              <td className="px-2 py-1.5 text-gray-600 border border-gray-100">{r.normal}</td>
              <td className="px-2 py-1.5 text-center border border-gray-100">{r.pain ? '✓' : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StrengthTable({ data }: { data: string }) {
  let rows: StrRow[] = [];
  try { rows = JSON.parse(data); } catch { return <p className="text-xs text-gray-500">{data}</p>; }
  if (!rows.length) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs text-right border-collapse">
        <thead>
          <tr className="bg-gray-50">
            {['العضلة', 'الدرجة', 'ملاحظات'].map(h => (
              <th key={h} className="px-2 py-1.5 font-bold text-gray-500 border border-gray-100">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border border-gray-100">
              <td className="px-2 py-1.5 font-medium text-gray-700 border border-gray-100">{r.muscle}</td>
              <td className="px-2 py-1.5 text-gray-600 border border-gray-100">{r.grade}</td>
              <td className="px-2 py-1.5 text-gray-600 border border-gray-100">{r.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
