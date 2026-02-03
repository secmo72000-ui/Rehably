import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://rehably.runasp.net';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============ HELPER FUNCTIONS ============

/**
 * Get auth tokens from localStorage (Zustand persist storage)
 */
function getTokensFromStorage(): { accessToken: string | null; refreshToken: string | null } {
  if (typeof window === 'undefined') {
    return { accessToken: null, refreshToken: null };
  }
  
  try {
    const storage = localStorage.getItem('auth-storage');
    if (storage) {
      const state = JSON.parse(storage);
      return {
        accessToken: state.state?.accessToken || null,
        refreshToken: state.state?.refreshToken || null,
      };
    }
  } catch (e) {
    console.error('Error parsing auth storage', e);
  }
  
  return { accessToken: null, refreshToken: null };
}

/**
 * Update tokens in localStorage and cookies
 */
function updateTokensInStorage(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Update localStorage
    const storage = localStorage.getItem('auth-storage');
    if (storage) {
      const state = JSON.parse(storage);
      state.state.accessToken = accessToken;
      state.state.refreshToken = refreshToken;
      localStorage.setItem('auth-storage', JSON.stringify(state));
    }
    
    // Update cookies for middleware
    const expires7Days = new Date(Date.now() + 7 * 864e5).toUTCString();
    const expires30Days = new Date(Date.now() + 30 * 864e5).toUTCString();
    document.cookie = `accessToken=${encodeURIComponent(accessToken)}; expires=${expires7Days}; path=/; SameSite=Lax`;
    document.cookie = `refreshToken=${encodeURIComponent(refreshToken)}; expires=${expires30Days}; path=/; SameSite=Lax`;
  } catch (e) {
    console.error('Error updating tokens in storage', e);
  }
}

/**
 * Clear auth data from localStorage and cookies
 */
function clearAuthStorage(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('auth-storage');
  document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
}

// ============ TOKEN REFRESH QUEUE ============

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

function processQueue(error: Error | null, token: string | null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });
  failedQueue = [];
}

// ============ REQUEST INTERCEPTOR ============

apiClient.interceptors.request.use((config) => {
  const { accessToken } = getTokensFromStorage();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ============ RESPONSE INTERCEPTOR (Auto Token Refresh) ============

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    
    // Only handle 401 errors
    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }
    
    // Don't retry if already retried or if it's a refresh token request
    if (originalRequest._retry || originalRequest.url?.includes('/refresh')) {
      return Promise.reject(error);
    }
    
    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }
    
    originalRequest._retry = true;
    isRefreshing = true;
    
    try {
      const { refreshToken } = getTokensFromStorage();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      // Call refresh endpoint
      const response = await axios.post(`${API_URL}/api/Auth/refresh`, {
        refreshToken,
      });
      
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
      
      // Update storage
      updateTokensInStorage(newAccessToken, newRefreshToken);
      
      // Process queued requests with new token
      processQueue(null, newAccessToken);
      
      // Retry original request with new token
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
      
    } catch (refreshError) {
      // Refresh failed - clear auth and redirect to login
      processQueue(refreshError as Error, null);
      clearAuthStorage();
      
      // Redirect to login
      if (typeof window !== 'undefined') {
        const locale = window.location.pathname.split('/')[1] || 'ar';
        window.location.href = `/${locale}/login`;
      }
      
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
