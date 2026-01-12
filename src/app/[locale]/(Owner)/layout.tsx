import { type Locale, isRtlLocale } from "@/configs/i18n.config";
import { getOwnerSidebarItems, getSidebarLogoutLabel } from "@/configs/navigation";
import { getTranslation } from "@/shared/i18n";
import { DashboardLayout } from "@/ui/layouts";

interface OwnerLayoutWrapperProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function OwnerLayoutWrapper({
  children,
  params,
}: OwnerLayoutWrapperProps) {
  const { locale } = await params;
  const t = (key: string) => getTranslation(locale as Locale, key);
  const isRtl = isRtlLocale(locale as Locale);

  // Get sidebar navigation items from config
  const sidebarItems = getOwnerSidebarItems(locale, t);
  const logoutLabel = getSidebarLogoutLabel(t);

  return (
    <DashboardLayout
      locale={locale}
      sidebarItems={sidebarItems}
      isRtl={isRtl}
      logoutLabel={logoutLabel}
    >
      {children}
    </DashboardLayout>
  );
}
