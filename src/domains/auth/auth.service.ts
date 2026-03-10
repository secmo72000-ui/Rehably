import { apiClient } from '@/services/api-client';
import { LoginResponse, User } from './auth.types';
import { ApiResponse } from '@/shared/types/common.types';

export const authService = {
  // ============ Email + Password Login ============
  
  /**
   * Login with email and password (Owner/Clinic staff)
   */
  login: async (credentials: { email: string; password: string }) => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/api/Auth/login', credentials);
    return response.data;
  },

  // ============ Phone + OTP Login (Patient) ============
  
  /**
   * Request OTP for phone login
   * @param phone - Phone number (e.g., "01012345678")
   */
  loginViaOtp: async (phone: string) => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/api/Auth/login-via-otp', { phone });
    return response.data;
  },

  /**
   * Verify OTP and get tokens
   * @param phone - Phone number
   * @param otp - One-time password (4-6 digits)
   */
  verifyOtpLogin: async (phone: string, otp: string) => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/api/Auth/verify-otp-login', { phone, otp });
    return response.data;
  },

  /**
   * Resend OTP
   * @param phone - Phone number
   */
  resendOtp: async (phone: string) => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/api/Auth/resend-otp', { phone });
    return response.data;
  },

  // ============ User Info ============
  
  /**
   * Get current user info
   * @param token - Optional token to use (useful when token is not yet persisted to localStorage)
   */
  me: async (token?: string) => {
    const config = token 
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};
    const response = await apiClient.get<ApiResponse<User>>('/api/Auth/me', config);
    return response.data;
  },

  // ============ Token Management ============
  
  /**
   * Refresh access token
   */
  refresh: async (refreshToken: string) => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/api/Auth/refresh', { refreshToken });
    return response.data;
  },

  /**
   * Logout (invalidate token on server)
   */
  logout: async () => {
    try {
      await apiClient.post('/api/Auth/logout');
    } catch (error) {
      // Logout might fail if token is expired, but we still want to clear local state
      console.warn('Logout API call failed:', error);
    }
  },

  // ============ Password Management ============
  
  /**
   * Request password reset OTP
   */
  forgotPassword: async (email: string) => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/api/otp/request', { email, purpose: 'password_reset' });
    return response.data;
  },

  /**
   * Verify OTP and get password reset token
   */
  verifyPasswordResetOtp: async (email: string, otp: string) => {
    // According to swagger, /api/otp/verify with purpose password_reset returns a reset token
    const response = await apiClient.post<ApiResponse<{ token: string }>>('/api/otp/verify', { email, otpCode: otp, purpose: 'password_reset' });
    return response.data;
  },

  /**
   * Reset password with Token
   */
  resetPassword: async (data: { token: string; newPassword: string }) => {
    // According to swagger API schema, /api/Auth/password/reset uses temporaryPassword and newPassword for token-based reset
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/api/Auth/password/reset', { temporaryPassword: data.token, newPassword: data.newPassword });
    return response.data;
  },

  /**
   * Change password (for logged in users)
   */
  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/api/Auth/change-password', data);
    return response.data;
  },
};
