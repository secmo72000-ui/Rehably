/**
 * Returns `text-right` for RTL languages and `text-left` for LTR languages.
 */
export const rtlTextAlign = (isRtl: boolean) => (isRtl ? "text-right" : "text-left");

/**
 * Returns `justify-end` for RTL languages and `justify-start` for LTR languages.
 * Useful for pinning items correctly based on layout direction.
 */
export const rtlJustify = (isRtl: boolean) => (isRtl ? "justify-end" : "justify-start");

/**
 * Returns `flex-row-reverse` for LTR languages, useful when the default layout is visual RTL.
 */
export const rtlFlexReverse = (isRtl: boolean) => (isRtl ? "" : "flex-row-reverse");
