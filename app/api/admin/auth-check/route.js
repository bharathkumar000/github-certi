import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    const admin = await verifyAdminToken(token);
    if (!admin) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({ authenticated: true, user: { email: admin.email, role: admin.role } });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}