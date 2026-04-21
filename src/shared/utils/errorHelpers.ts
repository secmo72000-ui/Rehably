/**
 * Extracts the real error message from an Axios/API error.
 * Reads: response.data.error.message → response.data.message → response.data.title → err.message
 * Falls back to `fallback` string if nothing found.
 */
export function getApiError(err: unknown, fallback = 'حدث خطأ. حاول مرة أخرى.'): string {
  if (!err) return fallback;
  const e = err as {
    response?: {
      data?: {
        error?: { message?: string };
        message?: string;
        title?: string;
        errors?: Record<string, string[]>;
      };
    };
    message?: string;
  };

  // ASP.NET validation problem details (400)
  const validationErrors = e?.response?.data?.errors;
  if (validationErrors) {
    const msgs = Object.values(validationErrors).flat().filter(Boolean);
    if (msgs.length) return msgs.join(' | ');
  }

  return (
    e?.response?.data?.error?.message ||
    e?.response?.data?.message ||
    e?.response?.data?.title ||
    e?.message ||
    fallback
  );
}

export const getFriendlyErrorMessage = (errorMsg: string, t: (key: string) => string) => {
    if (!errorMsg) return t('errors.unknown');
    
    // Check for Arabic characters - pass through if backend already returned Arabic
    if (/[\u0600-\u06FF]/.test(errorMsg)) return errorMsg;

    // Map common English errors to translation keys
    const lowerError = errorMsg.toLowerCase();
    
    if (lowerError.includes('network')) return t('errors.network');
    if (lowerError.includes('500')) return t('errors.server');
    if (lowerError.includes('404')) return t('errors.notFound');
    if (lowerError.includes('authorized') || lowerError.includes('forbidden')) return t('errors.unauthorized');
    
    // Default fallback
    return t('errors.operationFailed');
};
