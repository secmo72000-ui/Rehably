/**
 * Extracts the real error message from an Axios/API error.
 * Reads: response.data.error.message → response.data.message → response.data.title → err.message
 * Falls back to `fallback` string if nothing found.
 */
/** Returns true if a string looks like an HTML document rather than an API message */
function isHtml(s: unknown): boolean {
  if (typeof s !== 'string') return false;
  const t = s.trimStart();
  return t.startsWith('<!') || t.startsWith('<html') || t.startsWith('<HTML') || t.length > 500;
}

/** Safe extraction: returns the value only if it's a short non-HTML string */
function safeMsg(v: unknown): string | undefined {
  if (typeof v === 'string' && v.trim() && !isHtml(v)) return v;
  return undefined;
}

export function getApiError(err: unknown, fallback = 'حدث خطأ. حاول مرة أخرى.'): string {
  if (!err) return fallback;
  const e = err as {
    response?: {
      status?: number;
      data?: unknown;
    };
    message?: string;
  };

  const data = e?.response?.data as Record<string, unknown> | undefined;

  // ASP.NET validation problem details (400)
  if (data && typeof data === 'object') {
    const errs = (data as { errors?: Record<string, string[]> }).errors;
    if (errs && typeof errs === 'object') {
      const msgs = Object.values(errs).flat().filter(Boolean);
      if (msgs.length) return msgs.join(' | ');
    }
  }

  // HTTP status fallbacks for non-JSON responses
  const status = e?.response?.status;
  if (status === 404) return fallback;
  if (status === 403) return 'غير مصرح بهذه العملية';
  if (status === 402) return 'هذه الميزة غير متاحة في باقتك الحالية';
  if (status && status >= 500) return 'خطأ في الخادم. حاول مرة أخرى.';

  const candidates = [
    safeMsg((data as { error?: { message?: unknown } })?.error?.message),
    safeMsg((data as { message?: unknown })?.message),
    safeMsg((data as { title?: unknown })?.title),
    safeMsg(e?.message),
  ];

  return candidates.find(Boolean) ?? fallback;
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
