'use client';

import { usePathname, useRouter } from 'next/navigation';
import { i18nConfig, type Locale, getDirection } from '@/configs/i18n.config';

/**
 * Hook to manage locale/language switching
 */
export function useLocale() {
  const pathname = usePathname();
  const router = useRouter();

  // Extract current locale from pathname
  const currentLocale = (pathname.split('/')[1] || i18nConfig.defaultLocale) as Locale;

  /**
   * Switch to a different locale
   */
  const switchLocale = (newLocale: Locale) => {
    if (!i18nConfig.locales.includes(newLocale)) return;

    // Set cookie for middleware
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`; // 1 year

    // Replace locale in pathname
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPathname = segments.join('/');

    router.push(newPathname);
    router.refresh();
  };

  /**
   * Toggle between Arabic and English
   */
  const toggleLocale = () => {
    const newLocale = currentLocale === 'ar' ? 'en' : 'ar';
    switchLocale(newLocale);
  };

  return {
    locale: currentLocale,
    direction: getDirection(currentLocale),
    isRtl: getDirection(currentLocale) === 'rtl',
    locales: i18nConfig.locales,
    switchLocale,
    toggleLocale,
  };
}

