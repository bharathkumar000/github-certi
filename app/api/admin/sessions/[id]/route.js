import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME, verifyAdminToken } from '@/lib/auth';
import { getSessionById, updateSession, deleteSession } from '@/lib/db';

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return await verifyAdminToken(token);
}

export async function GET(request, { params }) {
  const admin = await checkAdminAuth();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const session = await getSessionById(id);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  return NextResponse.json({ session });
}

export async function PUT(request, { params }) {
  const admin = await checkAdminAuth();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const currentSession = await getSessionById(id);

    if (body.add_minutes !== undefined) {
      const addMins = Number(body.add_minutes);
      const currentExpiry = currentSession?.expires_at ? new Date(currentSession.expires_at).getTime() : Date.now();
      const baseTime = Math.max(Date.now(), currentExpiry);
      body.expires_at = new Date(baseTime + addMins * 60 * 1000).toISOString();
      body.is_active = true;
    } else if (body.duration_minutes !== undefined) {
      const dur = Number(body.duration_minutes);
      if (dur > 0) {
        body.expires_at = new Date(Date.now() + dur * 60 * 1000).toISOString();
        body.is_active = true;
      } else {
        body.expires_at = null;
      }
    }

    const updated = await updateSession(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, session: updated });
  } catch (error) {
    console.error('Failed to update session:', error);
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const admin = await checkAdminAuth();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  try {
    await deleteSession(id);
    return NextResponse.json({ success: true, message: 'Session deleted' });
  } catch (error) {
    console.error('Failed to delete session:', error);
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}
