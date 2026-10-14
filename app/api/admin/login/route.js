import { NextResponse } from 'next/server';
import { verifyAdminAccessCode, verifyAdminCredentials, createAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const accessCode = (body.accessKey || body.accessCode || body.code || body.password || '').trim();

    let admin = null;

    if (accessCode) {
      admin = await verifyAdminAccessCode(accessCode);
    } else if (body.email && body.password) {
      admin = await verifyAdminCredentials(body.email, body.password);
    }

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid admin access key. Please check and try again.' },
        { status: 401 }
      );
    }

    const token = await createAdminToken(admin);

    const response = NextResponse.json({
      success: true,
      user: { email: admin.email, role: admin.role }
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      // REMOVED maxAge to make it session-only cookie
      // This forces re-authentication on browser close/reopen and every refresh
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'An unexpected authentication error occurred.' },
      { status: 500 }
    );
  }
}
