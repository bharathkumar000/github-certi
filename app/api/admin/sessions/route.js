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
      certificate_template_path
    } = body;

    if (!session_name || !session_date) {
      return NextResponse.json(
        { error: 'Session name and session date are required.' },
        { status: 400 }
      );
    }

    const finalCode = (access_code && access_code.trim())
      ? access_code.trim().toUpperCase()
      : generateRandomAccessCode();

    const created = await createSession({
      session_name: session_name.trim(),
      session_date,
      access_code: finalCode,
      is_active: Boolean(is_active),
      date_mode,
      custom_date_text,
      timezone: timezone || 'Asia/Kolkata',
      certificate_template_path: certificate_template_path || '/templates/default-certificate.png'
    });

    return NextResponse.json({ success: true, session: created }, { status: 201 });
  } catch (error) {
    console.error('Failed to create session:', error);
    return NextResponse.json({ error: 'Failed to create workshop session' }, { status: 500 });
  }
}
