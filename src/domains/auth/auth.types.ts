// ============ Auth Response Types ============

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  mustChangePassword: boolean;
  emailVerified: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isActive: boolean;
  mustChangePassword: boolean;
  emailVerified: boolean;
  tenantId: string | null;
  clinicId: string | null;
  roles: string[];
  createdAt: string;
  lastLoginAt: string;
  accessFailedCount: number;
  lockoutEnd: string | null;
}

// ============ Auth Rules ============

/**
 * Check if user must change password on first login
 */
export function mustChangePasswordOnLogin(user: User): boolean {
  return user.mustChangePassword;
}

/**
 * Check if user email is verified
 */
export function isEmailVerified(user: User): boolean {
  return user.emailVerified;
}
