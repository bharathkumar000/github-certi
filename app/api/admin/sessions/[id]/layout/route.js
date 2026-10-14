import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME, verifyAdminToken } from '@/lib/auth';
import { getCertificateLayout, saveCertificateLayout, getSessionById } from '@/lib/db';

export async function GET(request, { params }) {
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

  const layout = await getCertificateLayout(id);
  return NextResponse.json({
    session,
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
}

export async function PUT(request, { params }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const layoutData = await request.json();
    const saved = await saveCertificateLayout(id, layoutData);
    return NextResponse.json({ success: true, layout: saved });
  } catch (error) {
    console.error('Failed to save layout:', error);
    return NextResponse.json({ error: 'Failed to save certificate layout' }, { status: 500 });
  }
}
