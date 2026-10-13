import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PARTICIPANT_COOKIE_NAME, verifyParticipantToken } from '@/lib/auth';
import { getSessionById, getCertificateLayout } from '@/lib/db';
import { resolveCertificateDate } from '@/lib/date-utils';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(PARTICIPANT_COOKIE_NAME)?.value;
    const participant = await verifyParticipantToken(token);

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
        name_x: 50,
        name_y: 49.5,
        name_font_family: 'Helvetica-Bold',
        name_font_size: 40,
        name_color: '#1a1f2c',
        name_alignment: 'center',
        name_max_width: 75,
        date_x: 27.5,
        date_y: 78.5,
        date_font_family: 'Helvetica',
        date_font_size: 15,
        date_color: '#475569',
        date_alignment: 'center'
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
