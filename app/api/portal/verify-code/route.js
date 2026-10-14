import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit';
import { findSessionByAccessCode } from '@/lib/db';
import { createParticipantToken, PARTICIPANT_COOKIE_NAME, ADMIN_COOKIE_NAME, verifyAdminToken, DEVICE_DOWNLOADED_COOKIE_NAME } from '@/lib/auth';

export async function POST(request) {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const clientIp = forwardedFor.split(',')[0].trim();

    // Check rate limit to prevent brute force attacks
    const rateStatus = checkRateLimit(clientIp);
    if (!rateStatus.allowed) {
      return NextResponse.json(
        { error: rateStatus.message },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const accessCode = body.accessCode ? body.accessCode.trim().toUpperCase() : '';
    const clientDeviceDownloaded = Boolean(body.clientDeviceDownloaded);

    // Enforce 1-download-per-device policy (computer & mobile)
    const cookieStore = await cookies();
    const hasDeviceDownloadedCookie = cookieStore.get(DEVICE_DOWNLOADED_COOKIE_NAME)?.value === 'true';
    const adminToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    const admin = await verifyAdminToken(adminToken);

    if ((hasDeviceDownloadedCookie || clientDeviceDownloaded) && !admin) {
      return NextResponse.json(
        {
          error: 'Download limit reached: A certificate has already been downloaded from this mobile device or computer. Each participant is strictly limited to 1 certificate download.',
          isDeviceBlocked: true
        },
        { status: 403 }
      );
    }

    if (!accessCode) {
      return NextResponse.json(
        { error: 'Please enter your workshop access code.' },
        { status: 400 }
      );
    }

    // Lookup session securely by hashed code
    const session = await findSessionByAccessCode(accessCode);

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid access code. Please verify the code provided by your workshop organizer.' },
        { status: 401 }
      );
    }

    if (session.expires_at && new Date(session.expires_at).getTime() <= Date.now()) {
      return NextResponse.json(
        { error: 'This access code has expired. Please contact your session organizer for a new access code.' },
        { status: 403 }
      );
    }

    if (!session.is_active) {
      return NextResponse.json(
        { error: 'This workshop access code is inactive or has expired. Please contact your organizer.' },
        { status: 403 }
      );
    }

    // Valid code -> reset rate limit for this IP
    resetRateLimit(clientIp);

    // Issue secure signed token
    const token = await createParticipantToken(session);

    const response = NextResponse.json({
      success: true,
      sessionId: session.id,
      sessionName: session.session_name
    });

    response.cookies.set({
      name: PARTICIPANT_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 4 // 4 hours
    });

    return response;
  } catch (error) {
    console.error('Code verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred during verification. Please try again.' },
      { status: 500 }
    );
  }
}
