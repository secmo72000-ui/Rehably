/**
 * Format date to DD/MM/YYYY
 * @param dateString ISO date string or Date object
 * @param locale Locale string (default: 'ar-EG')
 */
export const formatDate = (dateString: string | null | Date, locale: string = 'ar-EG'): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '-';
  }
};
