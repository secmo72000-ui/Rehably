import arTranslations from './ar.json';
import enTranslations from './en.json';
import type { Locale } from '@/configs/i18n.config';

type TranslationKeys = typeof arTranslations;

const translations: Record<Locale, TranslationKeys> = {
  ar: arTranslations,
  en: enTranslations as TranslationKeys,
};

/**
 * Get translation value by nested key path
 * @param locale - Current locale
 * @param key - Dot notation key path (e.g., "login.welcomeTitle")
 * @returns The translated string
 */
export function getTranslation(locale: Locale, key: string): string {
  const keys = key.split('.');
  let value: unknown = translations[locale];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : key;
}

/**
 * Get all translations for a specific namespace
 * @param locale - Current locale
 * @param namespace - Namespace key (e.g., "login")
 * @returns Object with all translations in that namespace
 */
export function getNamespaceTranslations<T = Record<string, string>>(
  locale: Locale, 
  namespace: keyof TranslationKeys
): T {
  return translations[locale][namespace] as T;
}

export { arTranslations, enTranslations };
