import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME, verifyAdminToken } from '@/lib/auth';
import { getSessions, createSession } from '@/lib/db';
import { generateRandomAccessCode } from '@/lib/access-code';

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return await verifyAdminToken(token);
}

export async function GET() {
  const admin = await checkAdminAuth();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sessions = await getSessions();
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    return NextResponse.json({ error: 'Failed to retrieve sessions' }, { status: 500 });
  }
}

export async function POST(request) {
  const admin = await checkAdminAuth();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      session_name,
      session_date,
      access_code,
      is_active = true,
      date_mode = 'auto_current',
      custom_date_text = '',
      timezone = 'Asia/Kolkata',
      certificate_template_path,
      expires_at,
      duration_minutes
    } = body;

    const finalDate = session_date || new Date().toISOString().split('T')[0];
    const finalName = (session_name && session_name.trim()) || `Participant Session - ${finalDate}`;

    let finalCode = (access_code && String(access_code).trim())
      ? String(access_code).trim().replace(/\D/g, '')
      : generateRandomAccessCode();

    if (!finalCode || finalCode.length !== 6) {
      finalCode = generateRandomAccessCode();
    }

    let finalExpiresAt = expires_at || null;
    const durNum = Number(duration_minutes);
    if (!finalExpiresAt && !isNaN(durNum) && durNum > 0) {
      finalExpiresAt = new Date(Date.now() + durNum * 60 * 1000).toISOString();
    }

    const created = await createSession({
      session_name: finalName,
      session_date: finalDate,
      access_code: finalCode,
      is_active: Boolean(is_active),
      expires_at: finalExpiresAt,
      duration_minutes: !isNaN(durNum) && durNum > 0 ? durNum : null,
      date_mode,
      custom_date_text,
      timezone: timezone || 'Asia/Kolkata',
      certificate_template_path: certificate_template_path || '/templates/gitopia-certificate.pdf'
    });

    return NextResponse.json({ success: true, session: created }, { status: 201 });
  } catch (error) {
    console.error('Failed to create session:', error);
    return NextResponse.json({ error: 'Failed to create workshop session' }, { status: 500 });
  }
}
