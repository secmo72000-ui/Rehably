/**
 * Navigation Configuration
 * 
 * Sidebar navigation items for different user roles
 */

import type { SidebarItem } from "@/ui/components/Sidebar";

/** Icon paths for Owner sidebar */
const OWNER_ICONS = {
  home: "/Admin/Sidebar/Main.svg",
  clinicManagement: "/Admin/Sidebar/Clinics-Management.svg",
  libraries: "/Admin/Sidebar/lib.svg",
  subscriptions: "/Admin/Sidebar/Subscriptions.svg",
  invoices: "/Admin/Sidebar/Bills.svg",
  reports: "/Admin/Sidebar/Reports.svg",
  loginRecords: "/Admin/Sidebar/logs.svg",
  settings: "/Admin/Sidebar/setting.svg",
} as const;

/** 
 * Get Owner sidebar navigation items
 * @param locale - Current locale for building hrefs
 * @param t - Translation function for sidebar labels
 */
export function getOwnerSidebarItems(
  locale: string,
  t: (key: string) => string
): SidebarItem[] {
  const basePath = `/${locale}`;
  
  return [
    {
      id: "home",
      label: t("sidebar.home"),
      href: `${basePath}/home`,
      iconSrc: OWNER_ICONS.home,
    },
    {
      id: "clinic-management",
      label: t("sidebar.clinicManagement"),
      href: `${basePath}/clinic-management`,
      iconSrc: OWNER_ICONS.clinicManagement,
    },
    {
      id: "libraries",
      label: t("sidebar.libraries"),
      href: `${basePath}/libraries`,
      iconSrc: OWNER_ICONS.libraries,
    },
    {
      id: "subscriptions",
      label: t("sidebar.subscriptions"),
      href: `${basePath}/subscriptions`,
      iconSrc: OWNER_ICONS.subscriptions,
    },
    {
      id: "invoices",
      label: t("sidebar.invoices"),
      href: `${basePath}/invoices`,
      iconSrc: OWNER_ICONS.invoices,
    },
    {
      id: "reports",
      label: t("sidebar.reports"),
      href: `${basePath}/reports`,
      iconSrc: OWNER_ICONS.reports,
    },
    {
      id: "login-records",
      label: t("sidebar.loginRecords"),
      href: `${basePath}/audit-logs`,
      iconSrc: OWNER_ICONS.loginRecords,
    },
    {
      id: "settings",
      label: t("sidebar.settings"),
      href: `${basePath}/settings`,
      iconSrc: OWNER_ICONS.settings,
    },
  ];
}

/** 
 * Get sidebar logout label
 * @param t - Translation function
 */
export function getSidebarLogoutLabel(t: (key: string) => string): string {
  return t("sidebar.logout");
}
