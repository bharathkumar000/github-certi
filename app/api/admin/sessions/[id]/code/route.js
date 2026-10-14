import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME, verifyAdminToken } from '@/lib/auth';
import { updateSession, getSessionById } from '@/lib/db';
import { generateRandomAccessCode, hashAccessCode } from '@/lib/access-code';

export async function POST(request, { params }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const session = await getSessionById(id);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    let newCode = body.custom_code ? String(body.custom_code).trim().replace(/\D/g, '') : generateRandomAccessCode();

    if (newCode.length !== 6) {
      return NextResponse.json({ error: 'Access code must be a 6-digit number.' }, { status: 400 });
    }

    const newHash = hashAccessCode(newCode);

    // Immediately update session with new code and hash. Old code stops working immediately!
    const updated = await updateSession(id, {
      access_code_hash: newHash,
      raw_code_for_admin: newCode
    });

    return NextResponse.json({
      success: true,
      new_code: newCode,
      message: 'Access code updated successfully. The previous code has been invalidated immediately.'
    });
  } catch (error) {
    console.error('Failed to change access code:', error);
    return NextResponse.json({ error: 'Failed to update access code' }, { status: 500 });
  }
}
