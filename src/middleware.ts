import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============ INLINE CONFIG (Edge Runtime compatible) ============
const LOCALES = ['ar', 'en'] as const;
const DEFAULT_LOCALE = 'ar';

// Public paths that don't require authentication (without locale prefix)
const PUBLIC_PATHS = [
  '/login',
  '/forgot-password',
  '/reset-password', 
  '/verify-otp',
  '/create-password',
  '/unauthorized'
];

// ============ PORTAL TYPES & ROLES ============
type PortalType = 'owner' | 'clinic' | 'patient';

const PORTAL_ROLES: Record<PortalType, string[]> = {
  owner: ['PlatformAdmin'],
  clinic: ['ClinicOwner', 'ClinicAdmin', 'Doctor', 'Receptionist'],
  patient: ['Patient'],
};

// ============ SUBDOMAIN HELPERS (Inlined for Edge Runtime) ============
function getSubdomainFromHost(hostname: string): string | null {
  // Handle localhost for development
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return null;
  }

  // Special handling for Vercel deployments
  if (hostname.endsWith('.vercel.app')) {
    const parts = hostname.split('.');
    // rehably-omega.vercel.app -> 3 parts -> no subdomain (owner)
    if (parts.length === 3) {
      return null;
    }
    // portal.rehably-omega.vercel.app -> 4 parts -> portal (patient)
    if (parts.length >= 4) {
      // Return the first part combined with potential second part logic if needed
      // But based on portal check logic below, we just need the prefix
      if (parts[0] === 'portal') {
         return `portal.${parts[1]}`;
      }
      return parts[0];
    }
  }

  const cleanHost = hostname.split(':')[0];
  const parts = cleanHost.split('.');
  
  if (parts.length >= 3) {
    // Check for patient portal (portal.clinic1.rehably.com)
    if (parts[0] === 'portal' && parts.length >= 4) {
      return `portal.${parts[1]}`;
    }
    return parts[0];
  }
  
  return null;
}

function getPortalType(subdomain: string | null): PortalType {
  if (!subdomain || subdomain === 'platform') return 'owner';
  if (subdomain.startsWith('portal.')) return 'patient';
  return 'clinic';
}

function decodeTokenRole(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.role || 
           payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
           null;
  } catch {
    return null;
  }
}

function isRoleAllowedForPortal(role: string | null, portalType: PortalType): boolean {
  if (!role) return false;
  return PORTAL_ROLES[portalType].includes(role);
}

function getDefaultPathForPortal(portalType: PortalType): string {
  switch (portalType) {
    case 'owner': return '/home';
    case 'clinic': return '/clinic/dashboard';
    case 'patient': return '/patient/home';
  }
}

// ============ MIDDLEWARE ============
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // 1. Skip next.js internals and static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // files like .svg, .png, etc.
  ) {
    return NextResponse.next();
  }

  // 2. Detect subdomain and portal type
  const subdomain = getSubdomainFromHost(hostname);
  const portalType = getPortalType(subdomain);

  // 3. Identify Locale
  const pathnameIsMissingLocale = LOCALES.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const locale = request.cookies.get('NEXT_LOCALE')?.value || DEFAULT_LOCALE;
    const validLocale = LOCALES.includes(locale as any) ? locale : DEFAULT_LOCALE;
    const newUrl = new URL(`/${validLocale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url);
    return NextResponse.redirect(newUrl);
  }

  // Extract locale from path
  const currentLocale = LOCALES.find(locale => 
    pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  ) || DEFAULT_LOCALE;

  // 4. Normalize path for auth check (remove locale)
  const pathWithoutLocale = pathname.replace(new RegExp(`^/${currentLocale}`), '') || '/';

  // 5. Check Auth
  const token = request.cookies.get('accessToken')?.value;
  const isPublic = PUBLIC_PATHS.some(path => path === pathWithoutLocale || pathWithoutLocale.startsWith(path));

  // Case A: User is NOT logged in
  if (!token) {
    if (isPublic) {
      // Add portal type header for login page to know which form to show
      const response = NextResponse.next();
      response.headers.set('x-portal-type', portalType);
      return response;
    }
    // Redirect to login for protected pages
    const loginUrl = new URL(`/${currentLocale}/login`, request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Case B: User IS logged in
  // Decode token to get role
  const userRole = decodeTokenRole(token);

  // 6. Validate role matches portal type (skip if already on /unauthorized to prevent loop)
  // In local development (localhost), skip role enforcement so any role can access any portal
  const isLocalDev = hostname.includes('localhost') || hostname.includes('127.0.0.1');
  if (!isLocalDev && pathWithoutLocale !== '/unauthorized' && !isRoleAllowedForPortal(userRole, portalType)) {
    return NextResponse.redirect(new URL(`/${currentLocale}/unauthorized`, request.url));
  }

  // 7. If trying to access login page while logged in, redirect to appropriate dashboard
  if (pathWithoutLocale === '/login') {
    const defaultPath = getDefaultPathForPortal(portalType);
    return NextResponse.redirect(new URL(`/${currentLocale}${defaultPath}`, request.url));
  }

  // 8. Handle root path - redirect to appropriate dashboard
  if (pathWithoutLocale === '/' || pathWithoutLocale === '') {
    const defaultPath = getDefaultPathForPortal(portalType);
    return NextResponse.redirect(new URL(`/${currentLocale}${defaultPath}`, request.url));
  }

  // Allow access with portal type header
  const response = NextResponse.next();
  response.headers.set('x-portal-type', portalType);
  return response;
}

export const config = {
  // Optimize matcher to skip static files entirely at the infrastructure level
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
