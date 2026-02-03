import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============ Theme Types ============

export type Theme = 'light' | 'dark';

export interface CustomColors {
  primary: string;
  secondary: string;
}

interface ThemeState {
  theme: Theme;
  customColors: CustomColors;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setCustomColors: (colors: Partial<CustomColors>) => void;
}

// ============ Default Colors ============

const defaultColors: CustomColors = {
  primary: '#7C3AED', // Purple
  secondary: '#10B981', // Emerald
};

// ============ Theme Store ============

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      customColors: defaultColors,
      
      setTheme: (theme) => {
        set({ theme });
        // Apply theme to document
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', theme === 'dark');
        }
      },
      
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },
      
      setCustomColors: (colors) => {
        set((state) => ({
          customColors: { ...state.customColors, ...colors },
        }));
        // Apply custom colors as CSS variables
        if (typeof document !== 'undefined') {
          const { customColors } = get();
          document.documentElement.style.setProperty('--color-primary', customColors.primary);
          document.documentElement.style.setProperty('--color-secondary', customColors.secondary);
        }
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Apply theme on rehydration
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', state.theme === 'dark');
            document.documentElement.style.setProperty('--color-primary', state.customColors.primary);
            document.documentElement.style.setProperty('--color-secondary', state.customColors.secondary);
          }
        }
      },
    }
  )
);
