"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/utils/cn";
import { Navbar, type NavbarProps } from "@/ui/components/Navbar";
import { Sidebar, type SidebarItem, type SidebarProps } from "@/ui/components/Sidebar";
import { useAuthStore } from "@/domains/auth/auth.store";

export interface DashboardLayoutProps {
  /** Page content */
  children: ReactNode;
  /** Current locale */
  locale: string;
  /** Sidebar navigation items */
  sidebarItems: SidebarItem[];
  /** Is RTL layout */
  isRtl?: boolean;
  /** Logout button label */
  logoutLabel?: string;
  /** Logout click handler (optional - uses auth store by default) */
  onLogout?: () => void;
  /** Custom navbar props */
  navbarProps?: Partial<Omit<NavbarProps, "onToggleSidebar" | "isRtl">>;
  /** Custom sidebar props */
  sidebarProps?: Partial<Omit<SidebarProps, "items" | "locale" | "isOpen" | "onClose" | "isRtl" | "logoutLabel" | "onLogout">>;
  /** Additional className for main content */
  className?: string;
}

export function DashboardLayout({
  children,
  locale,
  sidebarItems,
  isRtl = false,
  logoutLabel,
  onLogout,
  navbarProps,
  sidebarProps,
  className,
}: DashboardLayoutProps) {
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Handle logout - use provided handler or default to auth store
  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      await logout();
      router.push(`/${locale}/login`);
    }
  };

  return (
    <div className="min-h-screen bg-BG">
      {/* Navbar */}
      <Navbar
        onToggleSidebar={toggleSidebar}
        isRtl={isRtl}
        user={user ? {
          name: user.fullName || `${user.firstName} ${user.lastName}`,
          email: user.email,
          avatarUrl: undefined
        } : undefined}
        {...navbarProps}
      />

      {/* Sidebar */}
      <Sidebar
        items={sidebarItems}
        locale={locale}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        isRtl={isRtl}
        logoutLabel={logoutLabel}
        onLogout={handleLogout}
        {...sidebarProps}
      />

      {/* Main Content */}
      <main
        className={cn(
          "pt-16 md:pt-[88px]",
          "min-h-screen",
          // Sidebar offset on desktop
          isRtl ? "lg:pr-[217px]" : "lg:pl-[217px]",
          "transition-all duration-300",
          className
        )}
      >
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
