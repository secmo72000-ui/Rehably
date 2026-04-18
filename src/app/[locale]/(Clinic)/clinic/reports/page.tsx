'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/services/api-client';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MonthlyBreakdown {
  year: number;
  month: number;
  monthName: string;
  sessions: number;
  appointments: number;
  newPatients: number;
}

interface ReportSummary {
  from: string;
  to: string;
  totalPatients: number;
  newPatients: number;
  activePatients: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  attendanceRate: number;
  totalSessions: number;
  completedSessions: number;
  sessionCompletionRate: number;
  averagePainReduction: number | null;
  averagePatientSatisfaction: number | null;
  activeTreatmentPlans: number;
  completedTreatmentPlans: number;
  monthlyBreakdown: MonthlyBreakdown[];
}

interface SessionReportItem {
  id: string;
  sessionNumber: number;
  patientName: string;
  therapistName: string | null;
  sessionDate: string;
  durationMinutes: number;
  status: string;
  painLevel: number | null;
  patientSatisfaction: number | null;
  notes: string | null;
}

interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ApiWrap<T> {
  success: boolean;
  data: T;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateInput(d: Date): string {
  return d.toISOString().split('T')[0];
}

function getLast30Days(): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return { from: formatDateInput(from), to: formatDateInput(to) };
}

function formatDisplayDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: string | number;
  colorClass?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="text-xs text-gray-400 font-semibold mb-2">{label}</div>
      <span className={`text-2xl font-black ${colorClass ?? 'text-gray-800'}`}>{value}</span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
      <div className="h-3 w-24 bg-gray-200 rounded mb-3" />
      <div className="h-7 w-16 bg-gray-200 rounded" />
    </div>
  );
}

function DualBarChart({ data }: { data: MonthlyBreakdown[] }) {
  const maxSessions = Math.max(...data.map((d) => d.sessions), 1);
  const maxAppts = Math.max(...data.map((d) => d.appointments), 1);
  const overallMax = Math.max(maxSessions, maxAppts, 1);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-black text-gray-800">التوزيع الشهري</span>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-[#29AAFE]" />
            الجلسات
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-[#F5872A]" />
            المواعيد
          </span>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-36 text-gray-400 text-sm">لا توجد بيانات</div>
      ) : (
        <div className="flex items-end gap-3" style={{ height: '150px' }}>
          {data.map((d) => {
            const sessionPct = (d.sessions / overallMax) * 100;
            const apptPct = (d.appointments / overallMax) * 100;
            return (
              <div key={`${d.year}-${d.month}`} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full flex items-end justify-center gap-0.5"
                  style={{ height: '120px' }}
                >
                  <div
                    className="flex-1 rounded-t-md transition-all bg-[#29AAFE]"
                    style={{ height: `${sessionPct}%` }}
                    title={`جلسات: ${d.sessions}`}
                  />
                  <div
                    className="flex-1 rounded-t-md transition-all bg-[#F5872A]"
                    style={{ height: `${apptPct}%` }}
                    title={`مواعيد: ${d.appointments}`}
                  />
                </div>
                <span className="text-[10px] text-gray-400 font-semibold leading-tight text-center">
                  {d.monthName}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const statusMap: Record<string, { label: string; cls: string }> = {
  Completed: { label: 'مكتملة', cls: 'bg-green-50 text-green-600' },
  Scheduled: { label: 'مجدولة', cls: 'bg-blue-50 text-blue-600' },
  Cancelled: { label: 'ملغية', cls: 'bg-red-50 text-red-500' },
  NoShow: { label: 'لم يحضر', cls: 'bg-orange-50 text-orange-500' },
};

function StatusBadge({ status }: { status: string }) {
  const s = statusMap[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${s.cls}`}>
      {s.label}
    </span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type TabId = 'summary' | 'sessions';

export default function ReportsPage() {
  useParams(); // register locale param — not needed directly but keeps Next.js happy

  const defaults = getLast30Days();
  const [fromDate, setFromDate] = useState(defaults.from);
  const [toDate, setToDate] = useState(defaults.to);
  // pending inputs before "تطبيق" is clicked
  const [pendingFrom, setPendingFrom] = useState(defaults.from);
  const [pendingTo, setPendingTo] = useState(defaults.to);

  const [activeTab, setActiveTab] = useState<TabId>('summary');

  // Summary state
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(false);

  // Sessions state
  const [sessions, setSessions] = useState<SessionReportItem[]>([]);
  const [sessionsTotal, setSessionsTotal] = useState(0);
  const [sessionsTotalPages, setSessionsTotalPages] = useState(1);
  const [sessionsPage, setSessionsPage] = useState(1);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState(false);

  // ── Fetch summary ──
  const fetchSummary = useCallback(async (from: string, to: string) => {
    setSummaryLoading(true);
    setSummaryError(false);
    try {
      const res = await apiClient.get<ApiWrap<ReportSummary>>(
        '/api/clinic/reports/summary',
        { params: { from, to } }
      );
      setSummary(res.data.data);
    } catch {
      setSummaryError(true);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // ── Fetch sessions ──
  const fetchSessions = useCallback(async (from: string, to: string, page: number) => {
    setSessionsLoading(true);
    setSessionsError(false);
    try {
      const res = await apiClient.get<ApiWrap<PagedResult<SessionReportItem>>>(
        '/api/clinic/reports/sessions',
        { params: { from, to, page, pageSize: 20 } }
      );
      const paged = res.data.data;
      setSessions(paged.items);
      setSessionsTotal(paged.totalCount);
      setSessionsTotalPages(paged.totalPages);
    } catch {
      setSessionsError(true);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchSummary(fromDate, toDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When sessions tab becomes active, load page 1
  useEffect(() => {
    if (activeTab === 'sessions') {
      fetchSessions(fromDate, toDate, 1);
      setSessionsPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ── Apply date range ──
  const applyRange = () => {
    setFromDate(pendingFrom);
    setToDate(pendingTo);
    setSummary(null);
    setSessions([]);
    setSessionsPage(1);
    fetchSummary(pendingFrom, pendingTo);
    if (activeTab === 'sessions') fetchSessions(pendingFrom, pendingTo, 1);
  };

  const setPreset = (preset: 'last30' | 'last90' | 'thisYear') => {
    const to = new Date();
    let from = new Date();
    if (preset === 'last30') from.setDate(from.getDate() - 30);
    else if (preset === 'last90') from.setDate(from.getDate() - 90);
    else from = new Date(to.getFullYear(), 0, 1);
    setPendingFrom(formatDateInput(from));
    setPendingTo(formatDateInput(to));
  };

  const goToSessionsPage = (p: number) => {
    setSessionsPage(p);
    fetchSessions(fromDate, toDate, p);
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'summary', label: 'ملخص' },
    { id: 'sessions', label: 'الجلسات' },
  ];

  return (
    <div className="space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-gray-800">التقارير</h1>
      </div>

      {/* Date range controls */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-wrap items-end gap-3">
        {/* Preset buttons */}
        <div className="flex gap-2">
          {([
            { key: 'last30', label: 'آخر شهر' },
            { key: 'last90', label: 'آخر 3 أشهر' },
            { key: 'thisYear', label: 'هذه السنة' },
          ] as const).map((p) => (
            <button
              key={p.key}
              onClick={() => setPreset(p.key)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-[#29AAFE] hover:text-[#29AAFE] transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* From / To inputs */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-semibold whitespace-nowrap">من</label>
          <input
            type="date"
            value={pendingFrom}
            onChange={(e) => setPendingFrom(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-[#29AAFE] text-gray-700"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-semibold whitespace-nowrap">إلى</label>
          <input
            type="date"
            value={pendingTo}
            onChange={(e) => setPendingTo(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-[#29AAFE] text-gray-700"
          />
        </div>

        <button
          onClick={applyRange}
          className="bg-[#29AAFE] hover:bg-[#1A8FD9] text-white text-sm font-bold px-4 py-1.5 rounded-xl transition-colors"
        >
          تطبيق
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b-2 border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 text-sm font-bold transition-all border-b-2 -mb-[2px] ${
              activeTab === tab.id
                ? 'text-[#29AAFE] border-[#29AAFE]'
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Summary ── */}
      {activeTab === 'summary' && (
        <div className="space-y-5">
          {summaryLoading && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm animate-pulse h-48" />
            </>
          )}

          {summaryError && !summaryLoading && (
            <div className="bg-white rounded-2xl p-10 shadow-sm flex flex-col items-center gap-3 text-gray-400">
              <span className="text-4xl">⚠️</span>
              <span className="text-sm font-semibold text-gray-500">فشل في تحميل البيانات</span>
              <button
                onClick={() => fetchSummary(fromDate, toDate)}
                className="mt-2 bg-[#29AAFE] hover:bg-[#1A8FD9] text-white text-sm font-bold px-5 py-2 rounded-xl transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {!summaryLoading && !summaryError && summary && (
            <>
              {/* Row 1 — Patient stats */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <StatCard label="إجمالي المرضى" value={summary.totalPatients} />
                <StatCard label="مرضى جدد" value={summary.newPatients} colorClass="text-[#29AAFE]" />
                <StatCard label="المرضى النشطون" value={summary.activePatients} colorClass="text-green-600" />
              </div>

              {/* Row 2 — Appointment stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard label="إجمالي المواعيد" value={summary.totalAppointments} />
                <StatCard label="مكتملة" value={summary.completedAppointments} colorClass="text-green-600" />
                <StatCard label="ملغاة" value={summary.cancelledAppointments} colorClass="text-red-500" />
                <StatCard
                  label="نسبة الحضور"
                  value={`${summary.attendanceRate.toFixed(1)}%`}
                  colorClass="text-[#29AAFE]"
                />
              </div>

              {/* Row 3 — Session stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard label="إجمالي الجلسات" value={summary.totalSessions} />
                <StatCard label="مكتملة" value={summary.completedSessions} colorClass="text-green-600" />
                <StatCard
                  label="نسبة الإتمام"
                  value={`${summary.sessionCompletionRate.toFixed(1)}%`}
                  colorClass="text-[#29AAFE]"
                />
                <StatCard
                  label="متوسط رضا المريض"
                  value={
                    summary.averagePatientSatisfaction != null
                      ? `${summary.averagePatientSatisfaction.toFixed(1)}/5`
                      : '—'
                  }
                />
              </div>

              {/* Bar chart */}
              {summary.monthlyBreakdown.length > 0 && (
                <DualBarChart data={summary.monthlyBreakdown} />
              )}
            </>
          )}
        </div>
      )}

      {/* ── Tab 2: Sessions ── */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {sessionsLoading && (
            <div className="bg-white rounded-2xl p-10 shadow-sm flex items-center justify-center text-gray-400 text-sm font-semibold">
              جاري التحميل...
            </div>
          )}

          {sessionsError && !sessionsLoading && (
            <div className="bg-white rounded-2xl p-10 shadow-sm flex flex-col items-center gap-3 text-gray-400">
              <span className="text-4xl">⚠️</span>
              <span className="text-sm font-semibold text-gray-500">فشل في تحميل البيانات</span>
              <button
                onClick={() => fetchSessions(fromDate, toDate, sessionsPage)}
                className="mt-2 bg-[#29AAFE] hover:bg-[#1A8FD9] text-white text-sm font-bold px-5 py-2 rounded-xl transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {!sessionsLoading && !sessionsError && (
            <>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Header row */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <span className="font-bold text-gray-800">
                    الجلسات
                    {sessionsTotal > 0 && (
                      <span className="mr-2 text-xs font-normal text-gray-400">
                        ({sessionsTotal} إجمالي)
                      </span>
                    )}
                  </span>
                </div>

                {sessions.length === 0 ? (
                  <div className="p-10 flex items-center justify-center text-gray-400 text-sm">
                    لا توجد جلسات في هذه الفترة
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" dir="rtl">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          {[
                            'المريض',
                            'المعالج',
                            'التاريخ',
                            'المدة',
                            'الحالة',
                            'مستوى الألم',
                            'الرضا',
                            'ملاحظات',
                          ].map((h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-right text-xs font-bold text-gray-400 whitespace-nowrap"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.map((s) => (
                          <tr
                            key={s.id}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3 font-bold text-gray-800 whitespace-nowrap">
                              {s.patientName}
                            </td>
                            <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                              {s.therapistName ?? '—'}
                            </td>
                            <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                              {formatDisplayDate(s.sessionDate)}
                            </td>
                            <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                              {s.durationMinutes} د
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <StatusBadge status={s.status} />
                            </td>
                            <td className="px-4 py-3 text-center text-xs font-bold text-gray-700">
                              {s.painLevel != null ? `${s.painLevel}/10` : '—'}
                            </td>
                            <td className="px-4 py-3 text-center text-xs font-bold text-gray-700">
                              {s.patientSatisfaction != null ? `${s.patientSatisfaction}/5` : '—'}
                            </td>
                            <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate">
                              {s.notes
                                ? s.notes.length > 50
                                  ? s.notes.slice(0, 50) + '...'
                                  : s.notes
                                : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {sessionsTotalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    disabled={sessionsPage <= 1}
                    onClick={() => goToSessionsPage(sessionsPage - 1)}
                    className="px-3 py-1.5 text-sm font-semibold rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 hover:border-[#29AAFE] hover:text-[#29AAFE] transition-colors"
                  >
                    السابق
                  </button>

                  {Array.from({ length: sessionsTotalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === sessionsTotalPages ||
                        Math.abs(p - sessionsPage) <= 2
                    )
                    .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, idx) =>
                      p === 'ellipsis' ? (
                        <span key={`e-${idx}`} className="px-2 text-gray-400 text-sm">
                          ...
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => goToSessionsPage(p as number)}
                          className={`w-8 h-8 text-sm font-semibold rounded-lg transition-colors ${
                            sessionsPage === p
                              ? 'bg-[#29AAFE] text-white'
                              : 'border border-gray-200 text-gray-600 hover:border-[#29AAFE] hover:text-[#29AAFE]'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}

                  <button
                    disabled={sessionsPage >= sessionsTotalPages}
                    onClick={() => goToSessionsPage(sessionsPage + 1)}
                    className="px-3 py-1.5 text-sm font-semibold rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 hover:border-[#29AAFE] hover:text-[#29AAFE] transition-colors"
                  >
                    التالي
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
