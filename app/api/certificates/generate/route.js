import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PARTICIPANT_COOKIE_NAME, verifyParticipantToken, ADMIN_COOKIE_NAME, verifyAdminToken, DEVICE_DOWNLOADED_COOKIE_NAME } from '@/lib/auth';
import { getSessionById, getCertificateLayout, logCertificateDownload } from '@/lib/db';
import { resolveCertificateDate } from '@/lib/date-utils';
import { generateCertificatePdf } from '@/lib/certificate-generator';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const participantToken = cookieStore.get(PARTICIPANT_COOKIE_NAME)?.value;
    const adminToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

    const participant = await verifyParticipantToken(participantToken);
    const admin = await verifyAdminToken(adminToken);

    const body = await request.json().catch(() => ({}));
    const { participantName, sessionId: requestedSessionId } = body;

    // Must be either an authorized participant or an admin testing generation
    let sessionId = participant?.sessionId;
    if (!sessionId && admin && requestedSessionId) {
      sessionId = requestedSessionId;
    }

    // Check 1-download-per-device restriction for participants
    const isDeviceDownloaded = cookieStore.get(DEVICE_DOWNLOADED_COOKIE_NAME)?.value === 'true';
    if (isDeviceDownloaded && !admin) {
      return NextResponse.json(
        {
          error: 'Download limit exceeded: A certificate has already been downloaded from this mobile device or computer. Each participant is strictly limited to 1 download.',
          isDeviceBlocked: true
        },
        { status: 403 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please enter your workshop access code first.' },
        { status: 401 }
      );
    }

    // Name validation
    if (!participantName || !participantName.trim()) {
      return NextResponse.json(
        { error: 'Please enter your name before downloading the certificate.' },
        { status: 400 }
      );
    }

    const cleanName = participantName.trim();
    if (cleanName.length > 100) {
      return NextResponse.json(
        { error: 'Name is too long. Please enter a name under 100 characters.' },
        { status: 400 }
      );
    }

    // Retrieve session and verify it is active
    const session = await getSessionById(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Workshop session not found.' }, { status: 404 });
    }

    if (!session.is_active && !admin) {
      return NextResponse.json(
        { error: 'This workshop session is inactive. Certificates cannot be generated.' },
        { status: 403 }
      );
    }

    // Retrieve layout configuration
    const layout = (await getCertificateLayout(sessionId)) || {};

    // Resolve date in Asia/Kolkata timezone or custom date
    const dateText = resolveCertificateDate(session);

    // Generate high quality PDF certificate
    const pdfBytes = await generateCertificatePdf({
      participantName: cleanName,
      dateText,
      templatePath: session.certificate_template_path || '/templates/default-certificate.png',
      layout
    });

    // Record non-blocking download activity log
    try {
      await logCertificateDownload(session.id, session.session_name, 'success', cleanName);
    } catch (logErr) {
      console.warn('Logging certificate download failed (non-blocking):', logErr);
    }

    // Generate clean sanitized filename
    // e.g. GitHub_Workshop_Anu_Reddy.pdf
    const sanitizedName = cleanName.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
    const filename = `GitHub_Workshop_${sanitizedName}.pdf`;

    const response = new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    // Invalidate participant session cookie upon download so session ends
    // and record persistent 1-year device lock cookie
    if (!admin) {
      response.cookies.set(PARTICIPANT_COOKIE_NAME, '', {
        path: '/',
        maxAge: 0,
        httpOnly: true,
        sameSite: 'lax'
      });

      response.cookies.set(DEVICE_DOWNLOADED_COOKIE_NAME, 'true', {
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        httpOnly: false,
        sameSite: 'lax'
      });
    }

    return response;
  } catch (error) {
    console.error('Certificate generation error:', error);
    return NextResponse.json(
      { error: `Certificate generation failed: ${error.message || 'Internal server error'}` },
      { status: 500 }
    );
  }
}
