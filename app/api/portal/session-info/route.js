import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PARTICIPANT_COOKIE_NAME, verifyParticipantToken, ADMIN_COOKIE_NAME, verifyAdminToken, DEVICE_DOWNLOADED_COOKIE_NAME } from '@/lib/auth';
import { getSessionById, getCertificateLayout } from '@/lib/db';
import { resolveCertificateDate } from '@/lib/date-utils';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(PARTICIPANT_COOKIE_NAME)?.value;
    const adminToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    const participant = await verifyParticipantToken(token);
    const admin = await verifyAdminToken(adminToken);

    // Enforce 1-download-per-device check
    const hasDeviceDownloaded = cookieStore.get(DEVICE_DOWNLOADED_COOKIE_NAME)?.value === 'true';
    if (hasDeviceDownloaded && !admin) {
      return NextResponse.json(
        { error: 'Access denied: A certificate has already been downloaded from this mobile device or computer.', isDeviceBlocked: true },
        { status: 403 }
      );
    }

    if (!participant || !participant.sessionId) {
      return NextResponse.json(
        { error: 'Session not authorized or expired. Please re-enter your access code.' },
        { status: 401 }
      );
    }

    const session = await getSessionById(participant.sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Workshop session not found.' },
        { status: 404 }
      );
    }

    if (!session.is_active) {
      return NextResponse.json(
        { error: 'This workshop session has been deactivated by the administrator.' },
        { status: 403 }
      );
    }

    const layout = await getCertificateLayout(session.id);
    const resolvedDate = resolveCertificateDate(session);

    // Return only safe fields needed for rendering
    return NextResponse.json({
      session: {
        id: session.id,
        session_name: session.session_name,
        certificate_template_path: session.certificate_template_path || '/templates/default-certificate.png',
        display_date: resolvedDate,
        timezone: session.timezone || 'Asia/Kolkata'
      },
      layout: layout || {
        name_x: 7.25,
        name_y: 50.5,
        name_font_family: 'TeX Gyre Termes',
        name_font_size: 52,
        name_color: '#111827',
        name_alignment: 'left',
        name_max_width: 85,
        date_x: 74.2,
        date_y: 82.5,
        date_font_family: 'Helvetica',
        date_font_size: 13,
        date_color: '#334155',
        date_alignment: 'left'
      }
    });
  } catch (error) {
    console.error('Error fetching participant session info:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve session information.' },
      { status: 500 }
    );
  }
}
