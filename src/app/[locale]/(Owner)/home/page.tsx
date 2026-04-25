'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { Locale } from '@/configs/i18n.config';
import { useAuthStore } from '@/domains/auth/auth.store';
import { adminDashboardService, type AdminDashboardData, type RecentSubscriptionItem } from '@/domains/admin-dashboard/admin-dashboard.service';

// ─── Status map ───────────────────────────────────────────────────────────────

const subStatusMap: Record<string, { label: string; cls: string }> = {
  Trial:     { label: 'تجريبي',   cls: 'bg-yellow-50 text-yellow-600' },
  Active:    { label: 'نشط',      cls: 'bg-green-50 text-green-600' },
  Suspended: { label: 'موقوف',    cls: 'bg-orange-50 text-orange-600' },
  Cancelled: { label: 'ملغي',     cls: 'bg-red-50 text-red-500' },
  Expired:   { label: 'منتهي',    cls: 'bg-gray-100 text-gray-500' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  title, value, sub, trend, icon, color,
}: {
  title: string; value: string | number; sub?: string;
  trend?: number; icon?: string; color?: string;
}) {
  const trendCls = trend === undefined ? '' : trend >= 0 ? 'text-green-500' : 'text-red-500';
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-3 border border-gray-100">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 font-semibold">{title}</span>
        {icon && (
          <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${color ?? 'bg-[#E8F5FF]'}`}>
            {icon}
          </span>
        )}
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-black text-gray-800">
          {typeof value === 'number' ? value.toLocaleString('ar-EG') : value}
        </span>
        {trend !== undefined && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${trendCls} ${trend >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

function RecentSubsTable({ items, loading }: { items: RecentSubscriptionItem[]; loading: boolean }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <span className="font-bold text-gray-800 text-sm">آخر الاشتراكات</span>
        <span className="text-xs text-gray-400">{items.length} اشتراك</span>
      </div>
      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">جاري التحميل…</div>
      ) : items.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">لا توجد اشتراكات</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" dir="rtl">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['اسم العيادة', 'الباقة', 'تاريخ البدء', 'ينتهي في', 'الحالة'].map(h => (
                  <th key={h} className="px-4 py-3 text-right text-xs font-bold text-gray-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(s => {
                const st = subStatusMap[s.status] ?? { label: s.status, cls: 'bg-gray-100 text-gray-500' };
                return (
                  <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">{s.clinicName}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{s.packageName}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(s.startDate).toLocaleDateString('ar', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(s.endDate).toLocaleDateString('ar', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${st.cls}`}>{st.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function MiniDonut({ pct, color = '#29AAFE' }: { pct: number; color?: string }) {
  const r = 40, cx = 50, cy = 50;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth="12" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="12"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const params = useParams();
  const locale = params.locale as Locale;
  const { user } = useAuthStore();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminDashboardService.getDashboard()
      .then(setData)
      .catch(e => setError(e?.message ?? 'خطأ في التحميل'))
      .finally(() => setLoading(false));
  }, []);

  const d = data;
  const activeClinicsPct = d && d.totalClinics > 0
    ? Math.round((d.activeClinics / d.totalClinics) * 100) : 0;
  const activeSubsPct = d && d.totalClinics > 0
    ? Math.round((d.activeSubscriptions / d.totalClinics) * 100) : 0;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-800">
          مرحباً <span className="text-[#29AAFE]">{user?.firstName || ''}</span> 👋
        </h1>
        {error && <span className="text-xs text-red-500 bg-red-50 px-3 py-1 rounded-lg">{error}</span>}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي الإيرادات"
          value={d ? `${d.totalRevenue.toLocaleString('ar-EG')} ج.م` : '—'}
          icon="💰" color="bg-green-50"
        />
        <StatCard
          title="إجمالي العيادات"
          value={loading ? '—' : (d?.totalClinics ?? 0)}
          sub={d ? `${d.suspendedClinics} موقوف` : undefined}
          icon="🏥" color="bg-[#E8F5FF]"
        />
        <StatCard
          title="العيادات النشطة"
          value={loading ? '—' : (d?.activeClinics ?? 0)}
          sub={d ? `${activeClinicsPct}% من الإجمالي` : undefined}
          icon="✅" color="bg-teal-50"
        />
        <StatCard
          title="المستخدمون"
          value={loading ? '—' : (d?.totalUsers ?? 0)}
          sub={d ? `${d.activeSubscriptions} اشتراك نشط` : undefined}
          icon="👥" color="bg-purple-50"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Active clinics donut */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3">
          <span className="text-sm font-bold text-gray-700">العيادات النشطة</span>
          <div className="relative">
            <MiniDonut pct={activeClinicsPct} color="#29AAFE" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-black text-gray-800">{activeClinicsPct}%</span>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            {d?.activeClinics ?? 0} نشطة من {d?.totalClinics ?? 0}
          </div>
        </div>

        {/* Active subscriptions donut */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3">
          <span className="text-sm font-bold text-gray-700">الاشتراكات النشطة</span>
          <div className="relative">
            <MiniDonut pct={activeSubsPct} color="#10B981" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-black text-gray-800">{activeSubsPct}%</span>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            {d?.activeSubscriptions ?? 0} نشط من {d?.totalClinics ?? 0}
          </div>
        </div>

        {/* Revenue summary */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
          <span className="text-sm font-bold text-gray-700 mb-3">ملخص الإيرادات</span>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">إجمالي المدفوعات</span>
              <span className="text-sm font-black text-gray-800">
                {d ? `${d.totalRevenue.toLocaleString('ar-EG')} ج.م` : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">الاشتراكات النشطة</span>
              <span className="text-sm font-bold text-green-600">{d?.activeSubscriptions ?? '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">المستخدمون</span>
              <span className="text-sm font-bold text-purple-600">{d?.totalUsers ?? '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent subscriptions */}
      <RecentSubsTable items={d?.recentSubscriptions ?? []} loading={loading} />
    </div>
  );
}
