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
