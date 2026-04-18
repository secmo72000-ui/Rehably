'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/domains/auth/auth.store';
import { clinicDashboardService } from '@/domains/clinic-dashboard/clinic-dashboard.service';
import { appointmentsService } from '@/domains/appointments/appointments.service';
import type { ClinicDashboardData, RecentAppointmentItem } from '@/domains/clinic-dashboard/clinic-dashboard.types';
import type { AppointmentItem } from '@/domains/appointments/appointments.types';

// ── Helpers ────────────────────────────────────────────────
const DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const HOURS = ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00'];
const COLORS = [
  'bg-[#E8F5FF] border-r-[3px] border-[#29AAFE] hover:bg-[#29AAFE] hover:text-white',
  'bg-green-50 border-r-[3px] border-green-500 hover:bg-green-500 hover:text-white',
  'bg-yellow-50 border-r-[3px] border-orange-400 hover:bg-orange-400 hover:text-white',
];

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

// ── Sub-components ─────────────────────────────────────────

function StatCard({ title, value, sub }: { title: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-3">
      <span className="text-sm text-gray-400 font-semibold">{title}</span>
      <div className="flex items-center justify-between">
        <span className="text-3xl font-black text-gray-800">
          {typeof value === 'number' ? value.toLocaleString('ar-EG') : value}
        </span>
        {sub && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg">{sub}</span>}
      </div>
    </div>
  );
}

function WeeklyCalendar({ appointments }: { appointments: AppointmentItem[] }) {
  const today = new Date();
  const todayDay = today.getDay();
  const { start: startOfWeek } = getWeekBounds();
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d.getDate();
  });

  const getAptsForSlot = (dayIndex: number, hourStr: string) => {
    const hour = parseInt(hourStr.split(':')[0]);
    return appointments.filter(a => {
      const d = new Date(a.startTime);
      return d.getDay() === dayIndex && d.getHours() === hour;
    });
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-gray-800">التقويم الأسبوعي</span>
        <span className="text-xs text-gray-400">الأسبوع الحالي</span>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[600px] grid border border-gray-200 rounded-xl overflow-hidden" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
          <div className="bg-gray-50 border-b border-gray-200 p-2" />
          {DAYS_AR.map((day, i) => {
            const isToday = i === todayDay;
            return (
              <div key={day} className={`border-b border-l border-gray-200 p-2 text-center text-xs font-bold ${isToday ? 'bg-[#E8F5FF] text-[#29AAFE]' : 'bg-gray-50 text-gray-600'}`}>
                {day} {weekDates[i]}
                {isToday && <span className="mr-1 text-[#29AAFE]">⬤</span>}
              </div>
            );
          })}
          {HOURS.map(hour => (
            <React.Fragment key={hour}>
              <div className="bg-gray-50 border-b border-gray-100 p-1.5 text-[11px] text-gray-400 text-center">{hour}</div>
              {Array.from({ length: 7 }, (_, dayIndex) => {
                const apts = getAptsForSlot(dayIndex, hour);
                return (
                  <div key={dayIndex} className="border-b border-l border-gray-100 p-1 min-h-[52px]">
                    {apts.map((a, idx) => (
                      <div key={a.id} className={`rounded-md px-1.5 py-1 mb-1 cursor-pointer transition-all duration-150 group ${COLORS[idx % COLORS.length]}`}>
                        <div className="text-[11px] font-bold leading-tight truncate">{a.patientName}</div>
                        <div className="text-[10px] text-gray-400 group-hover:text-white/80 leading-tight">
                          {new Date(a.startTime).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

const aptStatusMap: Record<string, { label: string; cls: string }> = {
  Scheduled:  { label: 'مجدول',    cls: 'bg-[#E8F5FF] text-[#29AAFE]' },
  Confirmed:  { label: 'مؤكد',    cls: 'bg-green-50 text-green-600' },
  Completed:  { label: 'مكتمل',   cls: 'bg-gray-100 text-gray-600' },
  Cancelled:  { label: 'ملغي',    cls: 'bg-red-50 text-red-500' },
  NoShow:     { label: 'لم يحضر', cls: 'bg-yellow-50 text-yellow-600' },
};

function TodaySchedule({ items, loading }: { items: RecentAppointmentItem[]; loading: boolean }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-gray-800">جدول اليوم</span>
        <span className="text-xs text-gray-400">{items.length} موعد</span>
      </div>
      {loading ? (
        <div className="text-center py-8 text-gray-400 text-sm">جاري التحميل...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">لا توجد مواعيد اليوم</div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {items.map(apt => {
            const s = aptStatusMap[apt.status] ?? { label: apt.status, cls: 'bg-gray-100 text-gray-500' };
            return (
              <div key={apt.id} className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 hover:border-[#29AAFE] hover:shadow-sm transition-all duration-150 cursor-pointer">
                <div className="flex items-start justify-between mb-1.5">
                  <span className="text-sm font-bold text-gray-800">{apt.patientName}</span>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                  {apt.therapistName && <span>👨‍⚕️ {apt.therapistName}</span>}
                  <span>🕐 {new Date(apt.startTime).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })} - {new Date(apt.endTime).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>🏥 {apt.type}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SubscriptionCard({ data }: { data: ClinicDashboardData | null }) {
  const used = data?.activePatients ?? 0;
  const limit = data?.patientsLimit ?? 100;
  const usedPct = limit > 0 ? Math.round((used / limit) * 100) : 0;
  const planName = data?.subscriptionPlanName ?? '—';
  const endDate = data?.subscriptionEndDate
    ? new Date(data.subscriptionEndDate).toLocaleDateString('ar', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-gray-800">الاشتراك الحالي</span>
        <span className="text-xs text-[#29AAFE] font-semibold px-2 py-0.5 bg-[#E8F5FF] rounded-full">نشط</span>
      </div>
      <div className="flex flex-col items-center mb-4">
        <div
          className="relative w-28 h-28 rounded-full flex items-center justify-center"
          style={{ background: `conic-gradient(#29AAFE 0% ${usedPct}%, #E8F5FF ${usedPct}% 100%)` }}
        >
          <div className="absolute w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center">
            <span className="text-xl font-black text-gray-800">{usedPct}%</span>
            <span className="text-[10px] text-gray-400">مستخدم</span>
          </div>
        </div>
      </div>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between text-gray-600">
          <span className="font-semibold">المرضى</span>
          <span className="font-bold text-gray-800">{used} / {limit}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span className="font-semibold">الباقة</span>
          <span className="font-bold text-gray-800">{planName}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span className="font-semibold">تنتهي في</span>
          <span className="font-bold text-gray-800">{endDate}</span>
        </div>
      </div>
      <button className="mt-4 w-full bg-[#29AAFE] hover:bg-[#1A8FD9] text-white text-xs font-bold py-2 rounded-xl transition-colors">
        ترقية الباقة
      </button>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────
export default function ClinicDashboardPage() {
  const { user } = useAuthStore();
  const [dashboard, setDashboard] = useState<ClinicDashboardData | null>(null);
  const [calendarApts, setCalendarApts] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dashData, calData] = await Promise.allSettled([
        clinicDashboardService.getDashboard(),
        appointmentsService.getCalendar(
          (() => { const { start } = getWeekBounds(); return start.toISOString(); })(),
          (() => { const { end } = getWeekBounds(); return end.toISOString(); })(),
        ),
      ]);
      if (dashData.status === 'fulfilled') setDashboard(dashData.value);
      if (calData.status === 'fulfilled') setCalendarApts(calData.value);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const d = dashboard;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-black text-gray-800">
        مرحبا بك <span className="text-[#29AAFE]">دكتور {user?.firstName || ''}</span> 👋
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="إجمالي المرضى"        value={d?.totalPatients ?? '—'}            sub={d ? `${d.activePatients} نشط` : undefined} />
        <StatCard title="مواعيد اليوم"          value={d?.todayAppointments ?? '—'}         sub={d ? `${d.weekAppointments} هذا الأسبوع` : undefined} />
        <StatCard title="مواعيد معلقة"          value={d?.pendingAppointments ?? '—'}       />
        <StatCard title="جلسات مكتملة (الشهر)"  value={d?.completedSessionsThisMonth ?? '—'} sub={d ? `من ${d.sessionsThisMonth}` : undefined} />
      </div>

      {/* Weekly Calendar */}
      <WeeklyCalendar appointments={calendarApts} />

      {/* Bottom: today schedule + subscription */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <TodaySchedule items={d?.todaySchedule ?? []} loading={loading} />
        </div>
        <div>
          <SubscriptionCard data={d} />
        </div>
      </div>
    </div>
  );
}
