// ============ Portal Types ============

export type PortalType = 'owner' | 'clinic' | 'patient';

// ============ Role-Portal Mapping ============

const PORTAL_ROLES: Record<PortalType, string[]> = {
  owner: ['PlatformAdmin'],
  clinic: ['ClinicOwner', 'ClinicAdmin', 'Doctor', 'Receptionist'],
  patient: ['Patient'],
};

// ============ Subdomain Detection ============

/**
 * Get current subdomain from window.location
 * Returns null if on localhost without subdomain
 */
export function getSubdomain(): string | null {
  if (typeof window === 'undefined') return null;
  
  const hostname = window.location.hostname;
  
  // Handle localhost (no subdomain in development)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null;
  }
  
  // Extract subdomain from hostname
  // e.g., "clinic1.rehably.com" → "clinic1"
  // e.g., "portal.clinic1.rehably.com" → "portal.clinic1"
  const parts = hostname.split('.');
  
  // If hostname is just "rehably.com" (2 parts), no subdomain
  if (parts.length <= 2) {
    return null;
  }

  // Special handling for Vercel deployments (e.g. rehably-omega.vercel.app)
  // If it ends with vercel.app and has 3 parts, it's the root domain (no subdomain)
  if (hostname.endsWith('.vercel.app') && parts.length === 3) {
    return null;
  }
  
  // Return everything except the last 2 parts (domain + tld)
  return parts.slice(0, -2).join('.');
}

/**
 * Determine portal type based on subdomain
 * - "platform" → owner
 * - "portal.*" → patient
 * - anything else → clinic
 */
export function getPortalType(subdomain: string | null): PortalType {
  if (!subdomain || subdomain === 'platform') return 'owner';
  if (subdomain.startsWith('portal.') || subdomain.startsWith('portal')) return 'patient';
  return 'clinic';
}

/**
 * Derive portal type from a role string (tenant-scoped roles supported).
 * Used when no subdomain is present (Vercel, custom domain root).
 */
export function getPortalTypeFromRole(role: string): PortalType | null {
  for (const [portal, roles] of Object.entries(PORTAL_ROLES) as [PortalType, string[]][]) {
    if (roles.some(r => role === r || role.startsWith(r + '_'))) return portal as PortalType;
  }
  return null;
}

/**
 * Check if a role is allowed for a specific portal type
 */
export function isRoleAllowedForPortal(role: string, portalType: PortalType): boolean {
  // Roles can be tenant-scoped: e.g. "ClinicOwner_<guid>" — match by prefix
  return PORTAL_ROLES[portalType].some(r => role === r || role.startsWith(r + '_'));
}

/**
 * Get default path for a portal type after login
 */
export function getDefaultPathForPortal(portalType: PortalType): string {
  switch (portalType) {
    case 'owner':
      return '/home';
    case 'clinic':
      return '/clinic/dashboard';
    case 'patient':
      return '/patient/home';
    default:
      return '/home';
  }
}
