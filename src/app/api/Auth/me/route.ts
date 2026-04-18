import { NextRequest, NextResponse } from 'next/server';

const CLINIC_ROLES = ['ClinicOwner', 'ClinicAdmin', 'Doctor', 'Receptionist'];

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const part = token.split('.')[1];
    return JSON.parse(Buffer.from(part, 'base64url').toString());
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const payload = decodeJwtPayload(token);

  if (!payload) {
    return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
  }

  const role: string = payload.role || 'ClinicOwner';
  const isClinic = CLINIC_ROLES.includes(role);

  return NextResponse.json({
    success: true,
    data: {
      id: 'dev-user-001',
      email: payload.email || 'doctor@clinic.com',
      firstName: payload.firstName || (isClinic ? 'أحمد' : 'محمد'),
      lastName: isClinic ? 'محمد' : 'الإداري',
      fullName: isClinic ? 'دكتور أحمد محمد' : 'محمد الإداري',
      isActive: true,
      mustChangePassword: false,
      emailVerified: true,
      tenantId: 'dev-tenant-001',
      clinicId: isClinic ? 'dev-clinic-001' : null,
      roles: [role],
      createdAt: '2024-01-01T00:00:00Z',
      lastLoginAt: new Date().toISOString(),
      accessFailedCount: 0,
      lockoutEnd: null,
    },
  });
}
