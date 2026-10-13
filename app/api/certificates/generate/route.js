import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PARTICIPANT_COOKIE_NAME, verifyParticipantToken, ADMIN_COOKIE_NAME, verifyAdminToken } from '@/lib/auth';
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

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Certificate generation error:', error);
    return NextResponse.json(
      { error: `Certificate generation failed: ${error.message || 'Internal server error'}` },
      { status: 500 }
    );
  }
}
