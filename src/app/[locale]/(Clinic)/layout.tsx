'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useParams } from 'next/navigation';
import { cn } from '@/shared/utils/cn';
import { useAuthStore } from '@/domains/auth/auth.store';

// ── Nav items ──────────────────────────────────────────────
const navItems = [
  { id: 'dashboard',        label: 'الرئيسية',             href: 'clinic/dashboard',              icon: '🏠' },
  { id: 'appointments',     label: 'المواعيد والجلسات',    href: 'clinic/appointments',           icon: '📅' },
  { id: 'patients',         label: 'المرضى',               href: 'clinic/patients',               icon: '👥' },
  { id: 'treatment-plans',  label: 'خطط العلاج',           href: 'clinic/treatment-plans',        icon: '📋' },
  { id: 'staff',            label: 'فريق العيادة',          href: 'clinic/staff',                  icon: '👨‍⚕️' },
  { id: 'invoices',         label: 'الفواتير',              href: 'clinic/billing/invoices',       icon: '🧾' },
  { id: 'payments',         label: 'المدفوعات',             href: 'clinic/billing/payments',       icon: '💳' },
  { id: 'reports',          label: 'التقارير',              href: 'clinic/reports',                icon: '📊' },
  { id: 'library',          label: 'المكتبة الطبية',        href: 'clinic/library/exercises',      icon: '📚' },
  { id: 'branches',         label: 'الفروع',                href: 'clinic/branches',               icon: '🏢' },
  { id: 'roles',            label: 'الصلاحيات',             href: 'clinic/roles',                  icon: '🔑' },
  { id: 'settings',         label: 'الإعدادات',             href: 'clinic/settings',               icon: '⚙️' },
];

// ── Sidebar ────────────────────────────────────────────────
function ClinicSidebar({ locale, isOpen, onClose }: { locale: string; isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 right-0 z-50 w-[230px]',
          'bg-white border-l border-gray-100',
          'flex flex-col',
          'transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          'lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-[#29AAFE] flex items-center justify-center text-white font-black text-lg">
            R
          </div>
          <span className="text-xl font-black text-gray-800">Rehably</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const href = `/${locale}/${item.href}`;
              const isActive = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={item.id}>
                  <Link
                    href={href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
                      isActive
                        ? 'bg-[#29AAFE] text-white shadow-sm'
                        : 'text-gray-600 hover:bg-[#E8F5FF] hover:text-[#29AAFE]'
                    )}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Doctor card */}
        <div className="mx-3 mb-3 bg-[#E8F5FF] rounded-xl p-3 flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#29AAFE] to-[#1A8FD9] flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.firstName?.[0] || 'د'}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-gray-800 truncate">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-xs text-gray-400 truncate">{user?.email}</div>
          </div>
        </div>

        {/* Logout */}
        <div className="px-3 pb-4 border-t border-gray-100 pt-3">
          <button
            onClick={logout}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
          >
            <span>🚪</span>
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Topbar ─────────────────────────────────────────────────
function ClinicTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useAuthStore();

  return (
    <header className="fixed top-0 left-0 right-[230px] z-30 bg-white border-b border-gray-200 flex items-center justify-between px-7 h-[60px]">
      {/* Left: search + bell */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2 w-[260px]">
          <svg className="text-gray-400 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="البحث…"
            className="bg-transparent border-none outline-none text-sm text-gray-600 w-full placeholder:text-gray-400 text-right"
            dir="rtl"
          />
        </div>
        <button className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors relative">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">2</span>
        </button>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center"
          onClick={onMenuClick}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Right: user info */}
      <div className="flex items-center gap-2.5">
        <div className="text-right">
          <div className="text-sm font-bold text-gray-800">{user?.firstName} {user?.lastName}</div>
          <div className="text-xs text-gray-400">{user?.email}</div>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#29AAFE] to-[#1A8FD9] flex items-center justify-center text-white font-bold text-sm shrink-0">
          {user?.firstName?.[0] || 'د'}
        </div>
      </div>
    </header>
  );
}

// ── Root layout ────────────────────────────────────────────
export default function ClinicLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-cairo" dir="rtl">
      <ClinicSidebar
        locale={locale}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <ClinicTopbar onMenuClick={() => setSidebarOpen(true)} />
      <main className="mr-[230px] pt-[60px] p-7 min-h-screen">
        {children}
      </main>
    </div>
  );
}
