/**
 * Theme Configuration
 * 
 * Define here:
 * - Color palette (primary, secondary)
 * - CSS variables for light/dark modes
 * - Font configuration
 * - Border radius values
 */

export const themeConfig = {
  colors: {
    // Base Colors from Figma
    text: '#212529',
    subtitle: '#4a4a4a',
    white: '#ffffff',
    BG: '#f8f9fa',

    // Primary Colors (Blue)
    Primary: {
      50: '#eef4ff',
      100: '#dce9fe',
      200: '#bbd6fe',
      300: '#91c2fd',
      400: '#62b0fd',
      500: '#1a9df5',
      600: '#1381cb',
      700: '#0d65a0',
      800: '#074c7b',
      900: '#033354',
    },

    // Mint Colors
    mint: {
      50: '#e4fffa',
      100: '#b4fff2',
      200: '#05fee6',
      300: '#04eed7',
      400: '#04e1cc',
      500: '#03d1bd',
      600: '#02ab9b',
      700: '#018376',
      800: '#016056',
      900: '#003f38',
    },

    // Grey Colors
    grey: {
      50: '#eff1f3',
      100: '#dfe3e7',
      200: '#bbc5ce',
      300: '#9daab5',
      400: '#858f99',
      500: '#6c757d',
      600: '#5a6269',
      700: '#484e54',
      800: '#373c41',
      900: '#292d30',
    },

    // Error Colors
    error: {
      50: '#ffdbdb',
      400: '#ff7575',
      600: '#ff0f0f',
    },

    // Confirm/Success Colors
    confirm: {
      50: '#dbf0dc',
      400: '#6dc070',
      600: '#4caf50',
    },

    // Warning Colors
    warning: {
      50: '#fff2cc',
      400: '#d19d00',
      600: '#ffc107',
    },
  },

  typography: {
    fontFamily: {
      cairo: 'Cairo, sans-serif',
      sans: 'Cairo, sans-serif',
    },
    // Font sizes from Figma Design Tokens
    fontSize: {
      xs: '12px',     // text-xs
      sm: '14px',     // text-sm
      base: '16px',   // text-base
      lg: '18px',     // text-lg
      xl: '20px',     // text-xl
      '2xl': '24px',  // text-2xl
      '3xl': '30px',  // text-3xl
      '4xl': '36px',  // text-4xl
      '5xl': '48px',  // text-5xl
    },
    // Line heights from Figma Design Tokens
    lineHeight: {
      xs: '16px',     // text-xs
      sm: '20px',     // text-sm
      base: '24px',   // text-base
      lg: '28px',     // text-lg
      xl: '28px',     // text-xl
      '2xl': '32px',  // text-2xl
      '3xl': '38px',  // text-3xl
      '4xl': '44px',  // text-4xl
      '5xl': '60px',  // text-5xl
    },
    // Font weights from Figma Design Tokens
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: {
    borderRadius: {
      sm: '0.25rem',  // 4px
      md: '0.5rem',   // 8px
      lg: '0.75rem',  // 12px
      xl: '1rem',     // 16px
      '2xl': '1.5rem', // 24px
      full: '9999px',
    },
  },
} as const;

export type ThemeConfig = typeof themeConfig;
