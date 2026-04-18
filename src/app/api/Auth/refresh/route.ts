import { NextResponse } from 'next/server';

export async function POST() {
  // In dev mode, just return a fresh fake token so the app never gets stuck
  const header  = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    role: 'ClinicOwner',
    sub: 'dev-user',
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  })).toString('base64url');

  return NextResponse.json({
    success: true,
    data: {
      accessToken: `${header}.${payload}.dev-mock-signature`,
      refreshToken: `dev-refresh-${Date.now()}`,
      expiresAt: new Date(Date.now() + 7 * 864e5).toISOString(),
      mustChangePassword: false,
      emailVerified: true,
    },
  });
}
