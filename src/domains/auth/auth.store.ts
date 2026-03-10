import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LoginResponse, User } from './auth.types';
import { authService } from './auth.service';
import { 
  getSubdomain, 
  getPortalType, 
  isRoleAllowedForPortal,
  getDefaultPathForPortal,
  type PortalType 
} from '@/shared/utils/subdomain.utils';

// ============ Cookie Helpers ============
const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

// ============ Auth Store Interface ============
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  otpSent: boolean;
  otpPhone: string | null;
  error: string | null;
  
  // Email + Password login (Owner/Clinic)
  login: (email: string, password: string) => Promise<void>;
  
  // Phone + OTP login (Patient)
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  resetOtpState: () => void;
  
  logout: () => Promise<void>;
  setTokens: (tokens: LoginResponse) => void;
  getRedirectPath: () => string;
  validatePortalAccess: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      otpSent: false,
      otpPhone: null,
      error: null,

      // ============ Email + Password Login (Owner/Clinic) ============
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authService.login({ email, password });
          if (res.success) {
            const { accessToken, refreshToken } = res.data;
            
            // Save token to cookie for middleware to read (do this first!)
            setCookie('accessToken', accessToken, 7);
            setCookie('refreshToken', refreshToken, 30);
            
            // Save to state
            set({
              accessToken,
              refreshToken,
              isAuthenticated: true,
            });
            
            // Fetch user info
            const userRes = await authService.me(accessToken);
            if (userRes.success) {
              set({ user: userRes.data });
              
              // Validate portal access after getting user info
              const { validatePortalAccess } = get();
              if (!validatePortalAccess()) {
                // Clear auth if user doesn't have access to this portal
                await get().logout();
                throw new Error('لا يمكنك الوصول إلى هذه المنصة');
              }
            }
          }
        } catch (error: any) {
          console.error("Login failed", error);
          set({ error: error.message || 'فشل تسجيل الدخول' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // ============ Phone + OTP Login (Patient) ============
      sendOtp: async (phone) => {
        set({ isLoading: true, error: null });
        try {
          await authService.loginViaOtp(phone);
          set({ otpSent: true, otpPhone: phone });
        } catch (error: any) {
          console.error("Send OTP failed", error);
          set({ error: error.message || 'فشل إرسال رمز التحقق' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      verifyOtp: async (phone, otp) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authService.verifyOtpLogin(phone, otp);
          if (res.success) {
            const { accessToken, refreshToken } = res.data;
            
            // Save tokens
            setCookie('accessToken', accessToken, 7);
            setCookie('refreshToken', refreshToken, 30);
            
            set({
              accessToken,
              refreshToken,
              isAuthenticated: true,
              otpSent: false,
              otpPhone: null,
            });
            
            // Fetch user info
            const userRes = await authService.me(accessToken);
            if (userRes.success) {
              set({ user: userRes.data });
            }
          }
        } catch (error: any) {
          console.error("Verify OTP failed", error);
          set({ error: error.message || 'رمز التحقق غير صحيح' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      resetOtpState: () => {
        set({ otpSent: false, otpPhone: null, error: null });
      },

      // ============ Logout ============
      logout: async () => {
        // Call backend logout (best effort)
        try {
          await authService.logout();
        } catch {
          // Ignore logout API errors
        }
        
        // Clear state
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          otpSent: false,
          otpPhone: null,
          error: null,
        });
        
        // Clear cookies
        deleteCookie('accessToken');
        deleteCookie('refreshToken');
        
        // Clear localStorage
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('auth-storage');
        }
      },

      // ============ Token Management ============
      setTokens: (data) => {
        set({ 
          accessToken: data.accessToken, 
          refreshToken: data.refreshToken,
          isAuthenticated: true,
        });
        
        setCookie('accessToken', data.accessToken, 7);
        setCookie('refreshToken', data.refreshToken, 30);
      },

      // ============ Portal Access Validation ============
      validatePortalAccess: () => {
        const { user } = get();
        if (!user || !user.roles.length) return false;

        const role = user.roles[0];
        const subdomain = getSubdomain();
        const portalType = getPortalType(subdomain);
        
        return isRoleAllowedForPortal(role, portalType);
      },

      // ============ Get Redirect Path (with subdomain validation) ============
      getRedirectPath: () => {
        const { user, validatePortalAccess } = get();
        if (!user || !user.roles.length) return '/login';

        // Validate portal access
        if (!validatePortalAccess()) {
          return '/unauthorized';
        }

        const subdomain = getSubdomain();
        const portalType = getPortalType(subdomain);
        
        return getDefaultPathForPortal(portalType);
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // Sync cookies when store rehydrates from localStorage
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          setCookie('accessToken', state.accessToken, 7);
        }
        if (state?.refreshToken) {
          setCookie('refreshToken', state.refreshToken, 30);
        }
      },
    }
  )
);
