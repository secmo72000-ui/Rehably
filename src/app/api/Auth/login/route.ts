import { NextRequest, NextResponse } from 'next/server';

// ── Mock users for local dev preview (no backend needed) ──────────────────────
const MOCK_USERS = [
  {
    email: 'doctor@clinic.com',
    password: 'clinic123',
    role: 'ClinicOwner',
    firstName: 'أحمد',
    lastName: 'محمد',
  },
  {
    email: 'admin@rehably.com',
    password: 'admin123',
    role: 'PlatformAdmin',
    firstName: 'محمد',
    lastName: 'الإداري',
  },
  {
    email: 'receptionist@clinic.com',
    password: 'clinic123',
    role: 'Receptionist',
    firstName: 'سارة',
    lastName: 'أحمد',
  },
];

function makeJwt(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body   = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.dev-mock-signature`;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const user = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email?.toLowerCase() && u.password === password,
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 },
      );
    }

    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 days

    const accessToken = makeJwt({
      sub: user.email,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      exp,
    });

    return NextResponse.json({
      success: true,
      data: {
        accessToken,
        refreshToken: `dev-refresh-${Date.now()}`,
        expiresAt: new Date(exp * 1000).toISOString(),
        mustChangePassword: false,
        emailVerified: true,
      },
    });
  } catch {
    return NextResponse.json({ success: false, message: 'خطأ في الخادم' }, { status: 500 });
  }
}
