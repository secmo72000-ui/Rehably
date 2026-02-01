/**
 * Application Configuration
 * 
 * Define here:
 * - App name and version
 * - API base URL
 * - Supported locales (ar, en)
 * - Default theme
 */

export const appConfig = {
  name: 'Rehably',
  version: '0.1.0',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  defaultLocale: 'ar' as const,
  supportedLocales: ['ar', 'en'] as const,
  defaultTheme: 'light' as const,
} as const;

export type AppConfig = typeof appConfig;
