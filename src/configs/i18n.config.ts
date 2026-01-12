/**
 * i18n Configuration
 * 
 * Define here:
 * - Supported locales
 * - Default locale
 * - RTL languages
 */

export const i18nConfig = {
  defaultLocale: 'ar',
  locales: ['ar', 'en'] as const,
  
  // Languages that use RTL direction
  rtlLocales: ['ar'] as const,
} as const;

export type Locale = (typeof i18nConfig.locales)[number];

/**
 * Check if a locale uses RTL direction
 */
export function isRtlLocale(locale: Locale): boolean {
  return (i18nConfig.rtlLocales as readonly string[]).includes(locale);
}

/**
 * Get the text direction for a locale
 */
export function getDirection(locale: Locale): 'rtl' | 'ltr' {
  return isRtlLocale(locale) ? 'rtl' : 'ltr';
}

