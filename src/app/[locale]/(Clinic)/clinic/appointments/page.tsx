'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { appointmentsService } from '@/domains/appointments/appointments.service';
import { patientsService } from '@/domains/patients/patients.service';
import { insuranceService, invoiceService } from '@/domains/billing/billing.service';
import type { AppointmentItem } from '@/domains/appointments/appointments.types';
import type { PatientListItem } from '@/domains/patients/patients.types';
import type { PatientInsurance, BillingBreakdown } from '@/domains/billing/billing.types';
import { getApiError } from '@/shared/utils';

type TabId = 'calendar' | 'list';

const DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const HOURS = ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00'];

const statusMap: Record<string, { label: string; cls: string }> = {
  Scheduled:  { label: 'مجدول',    cls: 'bg-blue-50 text-blue-600' },
  Confirmed:  { label: 'مؤكد',    cls: 'bg-green-50 text-green-600' },
  Completed:  { label: 'مكتمل',   cls: 'bg-gray-100 text-gray-600' },
  Cancelled:  { label: 'ملغي',    cls: 'bg-red-50 text-red-500' },
  NoShow:     { label: 'لم يحضر', cls: 'bg-yellow-50 text-yellow-600' },
};

const COLORS = ['bg-[#E8F5FF] border-r-[3px] border-[#29AAFE]', 'bg-green-50 border-r-[3px] border-green-500', 'bg-yellow-50 border-r-[3px] border-orange-400'];

function getWeekBounds() {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function WeekCalendar({ appointments }: { appointments: AppointmentItem[] }) {
  const today = new Date();
  const todayDay = today.getDay();
  const { start: startOfWeek } = getWeekBounds();
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek); d.setDate(startOfWeek.getDate() + i); return d.getDate();
  });

  const getAptsForSlot = (dayIndex: number, hourStr: string) => {
    const hour = parseInt(hourStr.split(':')[0]);
    return appointments.filter(a => {
      const d = new Date(a.startTime);
      return d.getDay() === dayIndex && d.getHours() === hour;
    });
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px] grid border border-gray-200 rounded-xl overflow-hidden" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
        <div className="bg-gray-50 border-b border-gray-200 p-2" />
        {DAYS_AR.map((day, i) => (
          <div key={day} className={`border-b border-l border-gray-200 p-2 text-center text-xs font-bold ${i === todayDay ? 'bg-[#E8F5FF] text-[#29AAFE]' : 'bg-gray-50 text-gray-600'}`}>
            {weekDates[i]} {day}
          </div>
        ))}
        {HOURS.map(hour => (
          <React.Fragment key={hour}>
            <div className="bg-gray-50 border-b border-gray-100 p-1.5 text-[11px] text-gray-400 text-center">{hour}</div>
            {Array.from({ length: 7 }, (_, di) => (
              <div key={di} className="border-b border-l border-gray-100 p-1 min-h-[52px]">
                {getAptsForSlot(di, hour).map((a, idx) => (
                  <div key={a.id} className={`rounded-md px-1.5 py-1 mb-1 text-[11px] ${COLORS[idx % COLORS.length]}`}>
                    <div className="font-bold leading-tight truncate">{a.patientName}</div>
                    <div className="text-[10px] text-gray-400">{new Date(a.startTime).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                ))}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ── Add Appointment Modal (2-step: details → billing) ─────────────────
function AddAppointmentModal({ onClose, onSaved, patients }: {
  onClose: () => void;
  onSaved: () => void;
  patients: PatientListItem[];
}) {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 — appointment details
  const [form, setForm] = useState({ patientId: '', startTime: '', endTime: '', type: 0, notes: '' });

  // Step 2 — billing
  const [patientInsurances, setPatientInsurances] = useState<PatientInsurance[]>([]);
  const [selectedInsuranceId, setSelectedInsuranceId] = useState<string>('');
  const [unitPrice, setUnitPrice] = useState<string>('');
  const [promoCode, setPromoCode] = useState<string>('');
  const [breakdown, setBreakdown] = useState<BillingBreakdown | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [createInvoice, setCreateInvoice] = useState(true);
  const calcTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load patient insurances when patient selected
  useEffect(() => {
    if (!form.patientId) { setPatientInsurances([]); setSelectedInsuranceId(''); return; }
    insuranceService.getPatientInsurances(form.patientId)
      .then(setPatientInsurances)
      .catch(() => setPatientInsurances([]));
  }, [form.patientId]);

  // Debounced breakdown calculation
  useEffect(() => {
    if (step !== 2 || !unitPrice || Number(unitPrice) <= 0) { setBreakdown(null); return; }
    if (calcTimer.current) clearTimeout(calcTimer.current);
    calcTimer.current = setTimeout(async () => {
      setCalcLoading(true);
      try {
        const result = await invoiceService.calculateBreakdown({
          patientId: form.patientId,
          patientInsuranceId: selectedInsuranceId || undefined,
          lineItems: [{ description: 'جلسة علاجية', quantity: 1, unitPrice: Number(unitPrice), serviceType: 0 }],
          promoCode: promoCode || undefined,
        });
        setBreakdown(result);
      } catch { setBreakdown(null); }
      finally { setCalcLoading(false); }
    }, 500);
    return () => { if (calcTimer.current) clearTimeout(calcTimer.current); };
  }, [step, unitPrice, selectedInsuranceId, promoCode, form.patientId]);

  const goToStep2 = () => {
    if (!form.patientId || !form.startTime || !form.endTime) {
      setError('يرجى ملء جميع الحقول المطلوبة'); return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async () => {
    setSaving(true); setError(null);
    try {
      const apt = await appointmentsService.create({
        patientId: form.patientId,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        type: form.type,
        notes: form.notes || undefined,
      });

      // Create draft invoice if opted in and price entered
      if (createInvoice && unitPrice && Number(unitPrice) > 0) {
        await invoiceService.create({
          patientId: form.patientId,
          appointmentId: apt?.id,
          currency: 'EGP',
          lineItems: [{ description: 'جلسة علاجية', quantity: 1, unitPrice: Number(unitPrice), serviceType: 0 }],
          patientInsuranceId: selectedInsuranceId || undefined,
        });
      }

      onSaved(); onClose();
    } catch (err) {
      setError(getApiError(err, 'فشل في حفظ الموعد'));
    } finally { setSaving(false); }
  };

  const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#29AAFE] focus:ring-2 focus:ring-[#29AAFE]/10';

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-end" dir="rtl" onClick={onClose}>
      <div className="w-full max-w-sm h-full bg-white shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <div>
            <span className="text-base font-black text-gray-800">إضافة موعد جديد</span>
            <div className="flex gap-1.5 mt-1.5">
              {[1,2].map(n => (
                <div key={n} className={`h-1 rounded-full transition-all ${n === step ? 'w-8 bg-[#29AAFE]' : n < step ? 'w-4 bg-[#29AAFE]/40' : 'w-4 bg-gray-200'}`} />
              ))}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-xs rounded-xl px-3 py-2">{error}</div>}

          {/* ── Step 1: Appointment details ─────────────────────── */}
          {step === 1 && <>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">المريض *</label>
              <select value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))} className={`${inputCls} bg-white`}>
                <option value="">اختر المريض</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">وقت البداية *</label>
                <input type="datetime-local" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">وقت النهاية *</label>
                <input type="datetime-local" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">النوع</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: Number(e.target.value) }))} className={`${inputCls} bg-white`}>
                {[['0','علاج طبيعي'],['1','تقييم'],['2','متابعة'],['3','استشارة']].map(([v,l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">ملاحظات</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} className={`${inputCls} resize-none`} />
            </div>
          </>}

          {/* ── Step 2: Billing ─────────────────────────────────── */}
          {step === 2 && <>
            <p className="text-xs text-gray-400">أدخل سعر الجلسة لإنشاء فاتورة تلقائياً. يمكن تخطي هذه الخطوة.</p>

            {/* Unit price */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">سعر الجلسة (جنيه)</label>
              <input type="number" min="0" value={unitPrice} onChange={e => setUnitPrice(e.target.value)}
                placeholder="0.00" className={inputCls} dir="ltr" />
            </div>

            {/* Insurance selector */}
            {patientInsurances.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">تأمين المريض</label>
                <select value={selectedInsuranceId} onChange={e => setSelectedInsuranceId(e.target.value)} className={`${inputCls} bg-white`}>
                  <option value="">بدون تأمين</option>
                  {patientInsurances.filter(i => i.isActive).map(i => (
                    <option key={i.id} value={i.id}>
                      {i.providerNameArabic || i.providerName} — {i.coveragePercent}% تغطية
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Promo code */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">كود خصم (اختياري)</label>
              <input type="text" value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())}
                placeholder="أدخل الكود" className={inputCls} dir="ltr" />
            </div>

            {/* Breakdown */}
            {unitPrice && Number(unitPrice) > 0 && (
              <div className="bg-[#F8FAFC] rounded-xl p-4 space-y-2 border border-gray-100">
                <div className="text-xs font-bold text-gray-700 mb-3">تفاصيل الفاتورة</div>
                {calcLoading ? (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
                    </svg>
                    جاري الحساب…
                  </div>
                ) : breakdown ? (<>
                  {[
                    { label: 'المجموع الفرعي', val: breakdown.subTotal, cls: 'text-gray-600' },
                    breakdown.insuranceCoverageAmount > 0 && { label: 'تغطية التأمين', val: -breakdown.insuranceCoverageAmount, cls: 'text-green-600' },
                    breakdown.discountAmount > 0 && { label: 'الخصم', val: -breakdown.discountAmount, cls: 'text-orange-500' },
                    breakdown.taxAmount > 0 && { label: 'الضريبة', val: breakdown.taxAmount, cls: 'text-gray-500' },
                  ].filter((r): r is { label: string; val: number; cls: string } => !!r).map((row, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-gray-500">{row.label}</span>
                      <span className={row.cls}>{row.val < 0 ? '- ' : ''}{Math.abs(row.val).toFixed(2)} {breakdown.currency}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-2 mt-1 flex justify-between">
                    <span className="text-xs font-bold text-gray-800">إجمالي المريض</span>
                    <span className="text-sm font-black text-[#29AAFE]">{breakdown.patientDue.toFixed(2)} {breakdown.currency}</span>
                  </div>
                  {breakdown.insuranceDue > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">مستحق على التأمين</span>
                      <span className="text-green-600 font-semibold">{breakdown.insuranceDue.toFixed(2)} {breakdown.currency}</span>
                    </div>
                  )}
                </>) : (
                  <div className="text-xs text-gray-400">أدخل سعراً لعرض التفاصيل</div>
                )}
              </div>
            )}

            {/* Create invoice toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={createInvoice} onChange={e => setCreateInvoice(e.target.checked)}
                className="w-4 h-4 accent-[#29AAFE]" />
              <span className="text-xs font-semibold text-gray-700">إنشاء فاتورة مسودة تلقائياً</span>
            </label>
          </>}
        </div>

        {/* Footer */}
        <div className="shrink-0 p-5 border-t border-gray-100 flex gap-2">
          {step === 1 ? (
            <>
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50">إلغاء</button>
              <button onClick={goToStep2} className="flex-1 bg-[#29AAFE] hover:bg-[#1A8FD9] text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                التالي: الفوترة →
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setStep(1); setError(null); }} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50">← رجوع</button>
              <button onClick={handleSubmit} disabled={saving}
                className="flex-1 bg-[#29AAFE] hover:bg-[#1A8FD9] disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                {saving ? 'جاري الحفظ…' : 'تأكيد الحجز'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────
export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('calendar');
  const [showModal, setShowModal] = useState(false);

  const [calendarApts, setCalendarApts] = useState<AppointmentItem[]>([]);
  const [listApts, setListApts] = useState<AppointmentItem[]>([]);
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadCalendar = useCallback(async () => {
    const { start, end } = getWeekBounds();
    try {
      const apts = await appointmentsService.getCalendar(start.toISOString(), end.toISOString());
      setCalendarApts(apts);
    } catch { /* non-critical */ }
  }, []);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await appointmentsService.getAll({ page, pageSize: 20 });
      setListApts(result.items);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(getApiError(err, 'فشل في تحميل المواعيد'));
    } finally {
      setLoading(false);
    }
  }, [page]);

  const loadPatients = useCallback(async () => {
    try {
      const result = await patientsService.getAll({ page: 1, pageSize: 100 });
      setPatients(result.items);
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => { loadCalendar(); loadList(); loadPatients(); }, [loadCalendar, loadList, loadPatients]);

  const handleAction = async (id: string, action: 'confirm' | 'complete' | 'cancel') => {
    try {
      if (action === 'confirm') await appointmentsService.confirm(id);
      else if (action === 'complete') await appointmentsService.complete(id);
      else await appointmentsService.cancel(id, 'ملغي من قبل الإدارة');
      loadList();
      loadCalendar();
    } catch { /* ignore */ }
  };

  const tabs = [
    { id: 'calendar' as TabId, label: 'التقويم الأسبوعي' },
    { id: 'list' as TabId, label: 'قائمة المواعيد' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-gray-800">المواعيد</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 bg-[#29AAFE] hover:bg-[#1A8FD9] text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors">
          <span>+</span> إضافة موعد
        </button>
      </div>

      <div className="flex gap-1 border-b-2 border-gray-200">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 text-sm font-bold transition-all border-b-2 -mb-[2px] ${activeTab === tab.id ? 'text-[#29AAFE] border-[#29AAFE]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'calendar' && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <WeekCalendar appointments={calendarApts} />
        </div>
      )}

      {activeTab === 'list' && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3">{error}</div>}
          <div className="overflow-x-auto">
            <table className="w-full text-sm" dir="rtl">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['المريض', 'الطبيب', 'البداية', 'النهاية', 'النوع', 'الحالة', 'إجراءات'].map(h => (
                    <th key={h} className="px-4 py-3 text-right text-xs font-bold text-gray-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">جاري التحميل...</td></tr>
                ) : listApts.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">لا توجد مواعيد</td></tr>
                ) : listApts.map(a => {
                  const s = statusMap[a.status] ?? { label: a.status, cls: 'bg-gray-100 text-gray-500' };
                  return (
                    <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-gray-800 whitespace-nowrap">{a.patientName}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{a.therapistName ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{new Date(a.startTime).toLocaleString('ar')}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{new Date(a.endTime).toLocaleString('ar')}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{a.type}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.cls}`}>{s.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          {a.status === 'Scheduled' && (
                            <button onClick={() => handleAction(a.id, 'confirm')} className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100">تأكيد</button>
                          )}
                          {a.status === 'Confirmed' && (
                            <button onClick={() => handleAction(a.id, 'complete')} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">إتمام</button>
                          )}
                          {(a.status === 'Scheduled' || a.status === 'Confirmed') && (
                            <button onClick={() => handleAction(a.id, 'cancel')} className="text-xs px-2 py-1 bg-red-50 text-red-500 rounded-lg hover:bg-red-100">إلغاء</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-100">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40">السابق</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${page === n ? 'bg-[#29AAFE] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{n}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40">التالي</button>
            </div>
          )}
        </div>
      )}

      {showModal && <AddAppointmentModal onClose={() => setShowModal(false)} onSaved={() => { loadList(); loadCalendar(); }} patients={patients} />}
    </div>
  );
}
