/**
 * Configs barrel export
 */
export { appConfig } from './app.config';
export { themeConfig, type ThemeConfig } from './theme.config';
export { 
  i18nConfig, 
  isRtlLocale, 
  getDirection, 
  type Locale 
} from './i18n.config';
export { 
  getOwnerSidebarItems, 
  getSidebarLogoutLabel 
} from './navigation';
